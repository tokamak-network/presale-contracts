pragma solidity ^0.5.0;

import "./minime/MiniMeToken.sol";
import "./openzeppelin-solidity/math/SafeMath.sol";

contract VestingTokenStep is MiniMeToken {
    using SafeMath for uint256;

    bool public initiated;

    // Durations and timestamps are expressed in UNIX time, the same units as block.timestamp.
    uint256 public cliff;
    uint256 public start;
    uint256 public duration;
    uint256 public constant UNIT_IN_SECONDS = 60 * 60 * 24 * 30;

    mapping (address => uint256) public released;

    constructor (
        address tokenFactory,
        address payable parentToken,
        uint parentSnapShotBlock,
        string memory tokenName,
        uint8 decimalUnits,
        string memory tokenSymbol,
        bool transfersEnabled
    )
        public
        MiniMeToken(tokenFactory, parentToken, parentSnapShotBlock, tokenName, decimalUnits, tokenSymbol, transfersEnabled)
    {
        // solhint-disable-previous-line no-empty-blocks
    }

    modifier beforeInitiated() {
        require(!initiated, "VestingTokenStep: cannot execute after initiation");
        _;
    }

    modifier afterInitiated() {
        require(initiated, "VestingTokenStep: cannot execute before initiation");
        _;
    }

    /**
     * @notice Makes vested tokens releasable.
     * @param _start the time (as Unix time) at which point vesting starts
     * @param cliffDuration duration in unit(30 days) of the cliff in which tokens will begin to vest
     * @param _duration duration in unit(30 days) of the period in which the tokens will vest(after the cliff period)
     */
    function initiate(uint256 _start, uint256 cliffDuration, uint256 _duration) public beforeInitiated onlyController {
        initiated = true;

        enableTransfers(false);

        // solhint-disable-next-line max-line-length
        require(cliffDuration <= _duration, "VestingTokenStep: cliff is longer than duration");
        require(_duration != 0, "VestingTokenStep: duration is 0");
        // solhint-disable-next-line max-line-length
        require(_start.add(_duration.mul(UNIT_IN_SECONDS)) > block.timestamp, "VestingTokenStep: final time is before current time");

        duration = _duration;
        start = _start;
        cliff = start.add(cliffDuration.mul(UNIT_IN_SECONDS));
    }

    /**
     * @dev This is the actual transfer function in the token contract.
     * @param from The address holding the tokens being transferred
     * @param to The address of the recipient
     * @param amount The amount of tokens to be transferred
     */
    function doTransfer(address from, address to, uint amount) internal beforeInitiated {
        super.doTransfer(from, to, amount);
    }

    /**
     * @notice Destroys releasable tokens.
     * @param beneficiary the beneficiary of the tokens.
     */
    function destroyReleasableTokens(address beneficiary) public afterInitiated onlyController returns (uint256 unreleased) {
        unreleased = releasableAmount(beneficiary);

        require(unreleased != 0, "VestingTokenStep: no tokens are due");

        released[beneficiary] = released[beneficiary].add(unreleased);

        require(destroyTokens(beneficiary, unreleased), "VestingTokenStep: failed to destroy tokens");
    }

    /**
     * @dev Calculates the amount that has already vested but hasn't been released yet.
     * @param beneficiary the beneficiary of the tokens.
     */
    function releasableAmount(address beneficiary) public view returns (uint256) {
        return _vestedAmount(beneficiary).sub(released[beneficiary]);
    }

    /**
     * @dev Calculates the amount that has already vested.
     * @param beneficiary the beneficiary of the tokens.
     */
    function _vestedAmount(address beneficiary) private view returns (uint256) {
        if (!initiated) {
            return 0;
        }

        uint256 currentVestedAmount = balanceOf(beneficiary);
        uint256 totalVestedAmount = currentVestedAmount.add(released[beneficiary]);

        if (block.timestamp < cliff) {
            return 0;
        } else if (block.timestamp >= cliff.add(duration.mul(UNIT_IN_SECONDS))) {
            return totalVestedAmount;
        } else {
            uint256 currenUnit = block.timestamp.sub(cliff).div(UNIT_IN_SECONDS).add(1);
            return totalVestedAmount.mul(currenUnit).div(duration);
        }
    }
}
