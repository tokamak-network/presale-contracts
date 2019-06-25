pragma solidity ^0.5.0;

import "./openzeppelin-solidity/token/ERC20/SafeERC20.sol";
import "./openzeppelin-solidity/token/ERC20/IERC20.sol";
import "./openzeppelin-solidity/ownership/Secondary.sol";
import "./openzeppelin-solidity/math/SafeMath.sol";

/**
 * @title TokenVesting
 * @dev A token holder contract that can release its token balance gradually like a
 * typical vesting scheme, with a cliff and vesting period.
 */
contract TokenVesting is Secondary {
    // The vesting schedule is time-based (i.e. using block timestamps as opposed to e.g. block numbers), and is
    // therefore sensitive to timestamp manipulation (which is something miners can do, to a certain degree). Therefore,
    // it is recommended to avoid using short time durations (less than a minute). Typical vesting schemes, with a
    // cliff period of a year and a duration of four years, are safe to use.
    // solhint-disable not-rely-on-time

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    event TokensVested(address beneficiary, uint256 amount);
    event TokensReleased(address beneficiary, uint256 amount);
    event TokensRefunded(address refunder, address refundee, uint256 amount);

    IERC20 private _vestedToken;

    mapping (address => uint256) private _vested;
    mapping (address => uint256) private _released;

    // Durations and timestamps are expressed in UNIX time, the same units as block.timestamp.
    uint256 private _cliff;
    uint256 private _start;
    uint256 private _duration;

    constructor (IERC20 vestedToken) public {
        require(address(vestedToken) != address(0), "TokenVesting: token is zero address");

        _vestedToken = vestedToken;
    }

    function vestedToken() public view returns (IERC20) {
        return _vestedToken;
    }

    /**
     * @return the beneficiary of the tokens.
     */
    function vested(address beneficiary) public view returns (uint256) {
        return _vested[beneficiary];
    }

    /**
     * @return the cliff time of the token vesting.
     */
    function cliff() public view returns (uint256) {
        return _cliff;
    }

    /**
     * @return the start time of the token vesting.
     */
    function start() public view returns (uint256) {
        return _start;
    }

    /**
     * @return the duration of the token vesting.
     */
    function duration() public view returns (uint256) {
        return _duration;
    }

    /**
     * @param beneficiary the beneficiary of the tokens.
     * @return the amount of the token released.
     */
    function released(address beneficiary) public view returns (uint256) {
        return _released[beneficiary];
    }

    /**
     * @notice Makes vested tokens releasable.
     * @param start the time (as Unix time) at which point vesting starts
     * @param cliffDuration duration in seconds of the cliff in which tokens will begin to vest
     * @param duration duration in seconds of the period in which the tokens will vest
     */
    function initiate(uint256 start, uint256 cliffDuration, uint256 duration) public onlyPrimary {
        // solhint-disable-next-line max-line-length
        require(cliffDuration <= duration, "TokenVesting: cliff is longer than duration");
        require(duration > 0, "TokenVesting: duration is 0");
        // solhint-disable-next-line max-line-length
        require(start.add(duration) > block.timestamp, "TokenVesting: final time is before current time");

        _duration = duration;
        _cliff = start.add(cliffDuration);
        _start = start;
    }

    /**
     * @notice Transfers vested tokens to beneficiary.
     * @param beneficiary the beneficiary of the tokens.
     * @param amount the amount of the token.
     */
    function vest(address beneficiary, uint256 amount) public onlyPrimary {
        _vested[beneficiary] = _vested[beneficiary].add(amount);
        _vestedToken.safeTransferFrom(msg.sender, address(this), amount);

        emit TokensVested(beneficiary, amount);
    }

    /**
     * @notice Transfers vested tokens to beneficiary.
     * @param beneficiary the beneficiary of the tokens.
     */
    function release(address beneficiary) public returns (uint256) {
        return releaseAt(beneficiary, block.timestamp);
    }

    /**
     * @notice Transfers vested tokens to beneficiary.
     * @param beneficiary the beneficiary of the tokens.
     * @param timestamp the time related with releasable token amount.
     */
    function releaseAt(address beneficiary, uint256 timestamp) public onlyPrimary returns (uint256 unreleased) {
        require(_initiated, "TokenVesting: not yet initiated");

        require(timestamp <= block.timestamp, "TokenVesting: invalid timestamp");

        unreleased = _releasableAmount(beneficiary, timestamp);

        require(unreleased > 0, "TokenVesting: no tokens are due");

        _released[beneficiary] = _released[beneficiary].add(unreleased);
        _vested[beneficiary] = _vested[beneficiary].sub(unreleased);

        _vestedToken.safeTransfer(beneficiary, unreleased);

        emit TokensReleased(beneficiary, unreleased);
    }

    /**
     * @notice Transfers vested tokens to beneficiary.
     * @param refunder one who refunds.
     * @param refundee one who receives a refund.
     */
    function _refund(address refunder, address refundee) internal onlyPrimary returns (uint256 unreleased) {
        unreleased = _releasableAmount(refunder, block.timestamp);

        require(unreleased > 0, "TokenVesting: no tokens are due");

        _released[refunder] = _released[refunder].add(unreleased);
        _vested[refunder] = _vested[refunder].sub(unreleased);

        _vestedToken.safeTransfer(refundee, unreleased);

        emit TokensRefunded(refunder, refundee, unreleased);
    }

    /**
     * @dev Calculates the amount that has already vested but hasn't been released yet.
     * @param beneficiary the beneficiary of the tokens.
     * @param timestamp the time related with releasable token amount.
     */
    function _releasableAmount(address beneficiary, uint256 timestamp) private view returns (uint256) {
        return _vestedAmount(beneficiary, timestamp).sub(_released[beneficiary]);
    }

    /**
     * @dev Calculates the amount that has already vested.
     * @param beneficiary the beneficiary of the tokens.
     * @param timestamp the time related with releasable token amount.
     */
    function _vestedAmount(address beneficiary, uint256 timestamp) private view returns (uint256) {
        uint256 currentVestedAmount = _vested[beneficiary];
        uint256 totalVestedAmount = currentVestedAmount.add(_released[beneficiary]);

        if (timestamp < _cliff) {
            return 0;
        } else if (timestamp >= _start.add(_duration)) {
            return totalVestedAmount;
        } else {
            return totalVestedAmount.mul(timestamp.sub(_start)).div(_duration);
        }
    }
}