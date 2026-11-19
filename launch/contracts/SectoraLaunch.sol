// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/*
 * Sectora Launch — fair coin launches on any EVM network.
 *
 * Every coin is a fixed-supply ERC-20 (1,000,000,000 tokens, 18 decimals, no owner,
 * no mint, no tax). 800,000,000 are sold on a bonding curve held by this factory.
 * When the curve sells out, the coin graduates: all the native coin raised plus the
 * remaining 200,000,000 tokens become a Uniswap-V2-style pool and the LP tokens are
 * sent to 0x…dEaD, so nobody can ever withdraw that liquidity.
 *
 * Guarantees enforced by code:
 *  - Fair window: during the first 5 minutes a wallet can buy at most 1 % of supply.
 *  - Creator buy at launch: at most 5 % of supply, locked 7 days, then released
 *    linearly over 30 days.
 *  - Until graduation tokens only move to/from the curve. Nobody can seed the
 *    DEX pool early, so the graduation price cannot be manipulated.
 *  - 1 % fee per curve trade: 0.5 % to the coin creator, 0.5 % to the platform.
 *  - The owner can only change where platform fees are paid. It cannot pause,
 *    touch the curves, the raised funds or any coin.
 */

interface IV2Factory {
    function getPair(address a, address b) external view returns (address);
    function createPair(address a, address b) external returns (address);
}

interface IV2Pair {
    function mint(address to) external returns (uint256);
}

interface IWNative {
    function deposit() external payable;
    function transfer(address to, uint256 amount) external returns (bool);
}

contract SectoraLaunchToken {
    uint256 public constant totalSupply = 1_000_000_000 ether;
    uint8 public constant decimals = 18;

    string public name;
    string public symbol;
    address public factory;
    bool public graduated;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) private _allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() {
        factory = address(1); // the implementation itself can never be initialised
    }

    function initialize(string calldata name_, string calldata symbol_) external {
        require(factory == address(0), "SL: initialised");
        factory = msg.sender;
        name = name_;
        symbol = symbol_;
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    /// Called once by the factory when the coin moves to the DEX. Irreversible.
    function markGraduated() external {
        require(msg.sender == factory, "SL: only factory");
        graduated = true;
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        if (spender == factory && !graduated) return type(uint256).max;
        return _allowance[owner][spender];
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        _allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        // Before graduation the factory may pull tokens without an approval, so a
        // curve sale is a single transaction. The factory only ever pulls from the
        // wallet that calls sell(), and loses this right at graduation.
        if (!(msg.sender == factory && !graduated)) {
            uint256 a = _allowance[from][msg.sender];
            if (a != type(uint256).max) {
                require(a >= amount, "SL: allowance");
                unchecked { _allowance[from][msg.sender] = a - amount; }
            }
        }
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) private {
        // Until graduation only the factory moves tokens (curve buys, sells and the
        // creator's vesting). Nobody can seed or skew the DEX pool before it exists.
        if (!graduated) require(msg.sender == factory, "SL: curve only until graduation");
        require(to != address(0), "SL: zero address");
        uint256 b = balanceOf[from];
        require(b >= amount, "SL: balance");
        unchecked {
            balanceOf[from] = b - amount;
            balanceOf[to] += amount;
        }
        emit Transfer(from, to, amount);
    }
}

contract SectoraLaunchFactory {
    // ---- supply split (18 decimals) ----
    uint256 public constant SUPPLY = 1_000_000_000 ether;
    uint256 public constant CURVE_SUPPLY = 800_000_000 ether;
    uint256 public constant LP_SUPPLY = 200_000_000 ether;
    uint256 public constant VIRTUAL_TOKENS = 1_073_000_000 ether;

    // ---- rules ----
    uint256 public constant FEE_BPS = 100;          // 1 % per curve trade
    uint256 public constant FAIR_WINDOW = 5 minutes;
    uint256 public constant FAIR_CAP = 10_000_000 ether;  // 1 % of supply per wallet
    uint256 public constant DEV_CAP = 50_000_000 ether;   // 5 % of supply
    uint256 public constant DEV_CLIFF = 7 days;
    uint256 public constant DEV_VESTING = 30 days;
    uint256 public constant MAX_NAME = 32;
    uint256 public constant MAX_SYMBOL = 12;
    uint256 public constant MAX_META = 1024;
    address public constant DEAD = 0x000000000000000000000000000000000000dEaD;

    // ---- per-network configuration, fixed at deployment ----
    uint256 public immutable virtualNative;  // virtual native reserve of every curve
    uint256 public immutable launchFee;      // paid in native coin to create a coin
    address public immutable wrappedNative;  // WETH / WBNB / WPOL ...
    address public immutable dexFactory;     // Uniswap V2 compatible factory
    address public immutable tokenImplementation;

    address public owner;
    address public feeRecipient;
    uint256 public protocolFees;
    mapping(address => uint256) public creatorFees;

    struct Curve {
        address creator;
        uint64 createdAt;
        uint64 createdBlock;
        bool graduated;
        address pair;
        uint256 vNative;
        uint256 vToken;
        uint256 realNative;
        uint256 sold;
        uint256 devAmount;
        uint256 devClaimed;
    }

    mapping(address => Curve) public curves;
    mapping(address => string) public meta;
    mapping(address => mapping(address => uint256)) public fairBought;
    address[] public allTokens;

    uint256 private _lock = 1;

    event CoinCreated(address indexed token, address indexed creator, string name, string symbol, string meta, uint256 devTokens);
    event Trade(address indexed token, address indexed trader, bool isBuy, uint256 nativeAmount, uint256 tokenAmount, uint256 fee, uint256 vNative, uint256 vToken, uint256 timestamp);
    event Graduated(address indexed token, address indexed pair, uint256 nativeAmount, uint256 tokenAmount, uint256 liquidity);
    event DevClaimed(address indexed token, address indexed creator, uint256 amount);
    event CreatorFeesClaimed(address indexed creator, uint256 amount);
    event ProtocolFeesWithdrawn(address indexed to, uint256 amount);
    event FeeRecipientChanged(address indexed recipient);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier nonReentrant() {
        require(_lock == 1, "SL: reentrancy");
        _lock = 2;
        _;
        _lock = 1;
    }

    constructor(
        address owner_,
        address feeRecipient_,
        address wrappedNative_,
        address dexFactory_,
        uint256 virtualNative_,
        uint256 launchFee_
    ) {
        require(owner_ != address(0) && feeRecipient_ != address(0), "SL: zero address");
        require(wrappedNative_.code.length > 0 && dexFactory_.code.length > 0, "SL: DEX not found");
        require(virtualNative_ > 0, "SL: virtual reserve");
        owner = owner_;
        feeRecipient = feeRecipient_;
        wrappedNative = wrappedNative_;
        dexFactory = dexFactory_;
        virtualNative = virtualNative_;
        launchFee = launchFee_;
        tokenImplementation = address(new SectoraLaunchToken());
        emit OwnershipTransferred(address(0), owner_);
        emit FeeRecipientChanged(feeRecipient_);
    }

    // ------------------------------------------------------------------ create

    function createCoin(string calldata name_, string calldata symbol_, string calldata meta_, uint256 minDevTokens)
        external
        payable
        nonReentrant
        returns (address token)
    {
        uint256 nb = bytes(name_).length;
        uint256 sb = bytes(symbol_).length;
        require(nb > 0 && nb <= MAX_NAME, "SL: name length");
        require(sb > 0 && sb <= MAX_SYMBOL, "SL: symbol length");
        require(bytes(meta_).length <= MAX_META, "SL: meta too long");
        require(msg.value >= launchFee, "SL: launch fee");

        token = _clone(tokenImplementation);
        SectoraLaunchToken(token).initialize(name_, symbol_);

        Curve storage c = curves[token];
        c.creator = msg.sender;
        c.createdAt = uint64(block.timestamp);
        c.createdBlock = uint64(block.number);
        c.vNative = virtualNative;
        c.vToken = VIRTUAL_TOKENS;
        meta[token] = meta_;
        allTokens.push(token);
        protocolFees += launchFee;

        uint256 devTokens;
        uint256 devValue = msg.value - launchFee;
        if (devValue > 0) {
            uint256 fee = (devValue * FEE_BPS) / 10_000;
            uint256 net = devValue - fee;
            uint256 newVNative = c.vNative + net;
            uint256 newVToken = _ceilDiv(c.vNative * c.vToken, newVNative);
            devTokens = c.vToken - newVToken;
            require(devTokens <= DEV_CAP, "SL: creator buy above 5%");
            require(devTokens >= minDevTokens, "SL: slippage");
            c.vNative = newVNative;
            c.vToken = newVToken;
            c.realNative = net;
            c.sold = devTokens;
            c.devAmount = devTokens;
            _splitFee(msg.sender, fee);
            emit Trade(token, msg.sender, true, devValue, devTokens, fee, newVNative, newVToken, block.timestamp);
        }
        emit CoinCreated(token, msg.sender, name_, symbol_, meta_, devTokens);
    }

    // ------------------------------------------------------------------ trade

    function buy(address token, uint256 minTokens) external payable nonReentrant returns (uint256 tokensOut) {
        Curve storage c = curves[token];
        require(c.creator != address(0), "SL: unknown coin");
        require(!c.graduated, "SL: graduated, trade on the DEX");
        require(msg.value > 0, "SL: zero amount");

        uint256 fee = (msg.value * FEE_BPS) / 10_000;
        uint256 net = msg.value - fee;
        uint256 k = c.vNative * c.vToken;
        uint256 newVNative = c.vNative + net;
        uint256 newVToken = _ceilDiv(k, newVNative);
        tokensOut = c.vToken - newVToken;

        uint256 remaining = CURVE_SUPPLY - c.sold;
        uint256 refund;
        bool completes;
        if (tokensOut >= remaining) {
            // Last buy: take exactly what is left and refund the rest.
            completes = true;
            tokensOut = remaining;
            newVToken = c.vToken - remaining;
            newVNative = _ceilDiv(k, newVToken);
            net = newVNative - c.vNative;
            fee = _ceilDiv(net * FEE_BPS, 10_000 - FEE_BPS);
            if (net + fee > msg.value) fee = msg.value - net; // rounding dust (1 wei at most)
            refund = msg.value - net - fee;
        }
        require(tokensOut > 0, "SL: amount too small");
        require(tokensOut >= minTokens, "SL: slippage");

        if (block.timestamp < uint256(c.createdAt) + FAIR_WINDOW) {
            uint256 bought = fairBought[token][msg.sender] + tokensOut;
            require(bought <= FAIR_CAP, "SL: fair window cap (1% per wallet)");
            fairBought[token][msg.sender] = bought;
        }

        c.vNative = newVNative;
        c.vToken = newVToken;
        c.realNative += net;
        c.sold += tokensOut;
        _splitFee(c.creator, fee);

        require(SectoraLaunchToken(token).transfer(msg.sender, tokensOut), "SL: transfer");
        emit Trade(token, msg.sender, true, net + fee, tokensOut, fee, newVNative, newVToken, block.timestamp);

        if (completes) _graduate(token, c);
        if (refund > 0) _send(msg.sender, refund);
    }

    function sell(address token, uint256 tokensIn, uint256 minNative) external nonReentrant returns (uint256 nativeOut) {
        Curve storage c = curves[token];
        require(c.creator != address(0), "SL: unknown coin");
        require(!c.graduated, "SL: graduated, trade on the DEX");
        require(tokensIn > 0, "SL: zero amount");
        // Pull first (our own token, no hooks): selling more than you hold fails here
        // with a clear "SL: balance" instead of deeper in the maths.
        require(SectoraLaunchToken(token).transferFrom(msg.sender, address(this), tokensIn), "SL: transfer");

        uint256 newVToken = c.vToken + tokensIn;
        uint256 newVNative = _ceilDiv(c.vNative * c.vToken, newVToken);
        uint256 gross = c.vNative - newVNative;
        require(gross <= c.realNative, "SL: curve reserve");
        uint256 fee = (gross * FEE_BPS) / 10_000;
        nativeOut = gross - fee;
        require(nativeOut > 0, "SL: amount too small");
        require(nativeOut >= minNative, "SL: slippage");

        c.vNative = newVNative;
        c.vToken = newVToken;
        c.realNative -= gross;
        c.sold -= tokensIn;
        _splitFee(c.creator, fee);

        emit Trade(token, msg.sender, false, gross, tokensIn, fee, newVNative, newVToken, block.timestamp);
        _send(msg.sender, nativeOut);
    }

    // ------------------------------------------------------------------ creator

    function claimableDev(address token) public view returns (uint256) {
        Curve storage c = curves[token];
        if (c.devAmount == 0) return 0;
        uint256 start = uint256(c.createdAt) + DEV_CLIFF;
        if (block.timestamp <= start) return 0;
        uint256 elapsed = block.timestamp - start;
        uint256 vested = elapsed >= DEV_VESTING ? c.devAmount : (c.devAmount * elapsed) / DEV_VESTING;
        return vested - c.devClaimed;
    }

    function claimDev(address token) external nonReentrant {
        Curve storage c = curves[token];
        require(msg.sender == c.creator, "SL: only creator");
        uint256 amount = claimableDev(token);
        require(amount > 0, "SL: nothing to claim");
        c.devClaimed += amount;
        require(SectoraLaunchToken(token).transfer(msg.sender, amount), "SL: transfer");
        emit DevClaimed(token, msg.sender, amount);
    }

    function claimCreatorFees() external nonReentrant {
        uint256 amount = creatorFees[msg.sender];
        require(amount > 0, "SL: nothing to claim");
        creatorFees[msg.sender] = 0;
        emit CreatorFeesClaimed(msg.sender, amount);
        _send(msg.sender, amount);
    }

    // ------------------------------------------------------------------ platform

    function withdrawProtocolFees() external nonReentrant {
        uint256 amount = protocolFees;
        require(amount > 0, "SL: nothing to withdraw");
        protocolFees = 0;
        emit ProtocolFeesWithdrawn(feeRecipient, amount);
        _send(feeRecipient, amount);
    }

    function setFeeRecipient(address recipient) external {
        require(msg.sender == owner, "SL: only owner");
        require(recipient != address(0), "SL: zero address");
        feeRecipient = recipient;
        emit FeeRecipientChanged(recipient);
    }

    function transferOwnership(address newOwner) external {
        require(msg.sender == owner, "SL: only owner");
        require(newOwner != address(0), "SL: zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // ------------------------------------------------------------------ views

    struct CoinView {
        address token;
        string name;
        string symbol;
        string meta;
        address creator;
        uint64 createdAt;
        uint64 createdBlock;
        bool graduated;
        address pair;
        uint256 vNative;
        uint256 vToken;
        uint256 realNative;
        uint256 sold;
        uint256 devAmount;
        uint256 devClaimed;
    }

    function coinsCount() external view returns (uint256) {
        return allTokens.length;
    }

    function coinView(address token) public view returns (CoinView memory v) {
        Curve storage c = curves[token];
        v.token = token;
        if (c.creator == address(0)) return v;
        v.name = SectoraLaunchToken(token).name();
        v.symbol = SectoraLaunchToken(token).symbol();
        v.meta = meta[token];
        v.creator = c.creator;
        v.createdAt = c.createdAt;
        v.createdBlock = c.createdBlock;
        v.graduated = c.graduated;
        v.pair = c.pair;
        v.vNative = c.vNative;
        v.vToken = c.vToken;
        v.realNative = c.realNative;
        v.sold = c.sold;
        v.devAmount = c.devAmount;
        v.devClaimed = c.devClaimed;
    }

    /// Newest first: index 0 is the most recent coin.
    function latestCoins(uint256 offset, uint256 limit) external view returns (CoinView[] memory out) {
        uint256 n = allTokens.length;
        if (offset >= n) return new CoinView[](0);
        uint256 m = n - offset;
        if (limit < m) m = limit;
        out = new CoinView[](m);
        for (uint256 i = 0; i < m; i++) out[i] = coinView(allTokens[n - 1 - offset - i]);
    }

    function quoteBuy(address token, uint256 nativeIn)
        external
        view
        returns (uint256 tokensOut, uint256 fee, uint256 refund, bool completes)
    {
        Curve storage c = curves[token];
        if (c.creator == address(0) || c.graduated || nativeIn == 0) return (0, 0, 0, false);
        fee = (nativeIn * FEE_BPS) / 10_000;
        uint256 net = nativeIn - fee;
        uint256 k = c.vNative * c.vToken;
        uint256 newVToken = _ceilDiv(k, c.vNative + net);
        tokensOut = c.vToken - newVToken;
        uint256 remaining = CURVE_SUPPLY - c.sold;
        if (tokensOut >= remaining) {
            completes = true;
            tokensOut = remaining;
            uint256 newVNative = _ceilDiv(k, c.vToken - remaining);
            net = newVNative - c.vNative;
            fee = _ceilDiv(net * FEE_BPS, 10_000 - FEE_BPS);
            if (net + fee > nativeIn) fee = nativeIn - net;
            refund = nativeIn - net - fee;
        }
    }

    function quoteSell(address token, uint256 tokensIn) external view returns (uint256 nativeOut, uint256 fee) {
        Curve storage c = curves[token];
        if (c.creator == address(0) || c.graduated || tokensIn == 0) return (0, 0);
        uint256 newVNative = _ceilDiv(c.vNative * c.vToken, c.vToken + tokensIn);
        uint256 gross = c.vNative - newVNative;
        if (gross > c.realNative) gross = c.realNative;
        fee = (gross * FEE_BPS) / 10_000;
        nativeOut = gross - fee;
    }

    /// Native coin needed (fee included) to buy everything left on the curve.
    function costToComplete(address token) external view returns (uint256) {
        Curve storage c = curves[token];
        if (c.creator == address(0) || c.graduated) return 0;
        uint256 k = c.vNative * c.vToken;
        uint256 net = _ceilDiv(k, c.vToken - (CURVE_SUPPLY - c.sold)) - c.vNative;
        return net + _ceilDiv(net * FEE_BPS, 10_000 - FEE_BPS);
    }

    // ------------------------------------------------------------------ internal

    function _graduate(address token, Curve storage c) private {
        c.graduated = true;
        uint256 amount = c.realNative;
        c.realNative = 0;

        address pair = IV2Factory(dexFactory).getPair(token, wrappedNative);
        if (pair == address(0)) pair = IV2Factory(dexFactory).createPair(token, wrappedNative);
        c.pair = pair;

        SectoraLaunchToken(token).markGraduated();
        // Fund the pool directly and mint once: a pre-existing pair or wrapped-native
        // sent to it in advance cannot block or skew this step.
        IWNative(wrappedNative).deposit{value: amount}();
        require(IWNative(wrappedNative).transfer(pair, amount), "SL: wrap transfer");
        require(SectoraLaunchToken(token).transfer(pair, LP_SUPPLY), "SL: token transfer");
        uint256 liquidity = IV2Pair(pair).mint(DEAD);
        emit Graduated(token, pair, amount, LP_SUPPLY, liquidity);
    }

    function _splitFee(address creator, uint256 fee) private {
        uint256 toCreator = fee / 2;
        creatorFees[creator] += toCreator;
        protocolFees += fee - toCreator;
    }

    function _send(address to, uint256 amount) private {
        (bool ok, ) = payable(to).call{value: amount}("");
        require(ok, "SL: native transfer failed");
    }

    function _ceilDiv(uint256 a, uint256 b) private pure returns (uint256) {
        return a == 0 ? 0 : (a - 1) / b + 1;
    }

    function _clone(address impl) private returns (address instance) {
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(ptr, 0x14), shl(0x60, impl))
            mstore(add(ptr, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            instance := create(0, ptr, 0x37)
        }
        require(instance != address(0), "SL: clone failed");
    }
}
