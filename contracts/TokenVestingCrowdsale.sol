pragma solidity ^0.5.0;

import "./TokenVesting.sol";
import "./openzeppelin-solidity/token/ERC20/IERC20.sol";
import "./openzeppelin-solidity/crowdsale/Crowdsale.sol";

contract TokenVestingCrowdsale is Crowdsale {

    TokenVesting private _tokenVesting;

    bool private _initiated;

    constructor () public {
        _tokenVesting = new TokenVesting(token());
    /**
     * @dev Returns contract that token vests.
     */
    function tokenVesting() public view returns (TokenVesting) {
        return _tokenVesting;
    }

    /**
     * @notice Initiate vesting period, only if there are no remaining tokens.
     * @param start the time (as Unix time) at which point vesting starts
     * @param cliffDuration duration in seconds of the cliff in which tokens will begin to vest
     * @param duration duration in seconds of the period in which the tokens will vest
     */
    function initiate(uint256 start, uint256 cliffDuration, uint256 duration) public {
        require(_vestingAmount() != 0, "TokenVestingCrowdsale: vested token amount is the zero");
        require(_remainingAmount() == 0, "TokenVestingCrowdsale: all tokens have not been sold yet");

        _tokenVesting.initiate(start, cliffDuration, duration);
    }

    /**
     * @notice Transfers vested tokens to beneficiary.
     */
    function release() public returns (uint256) {
        return _tokenVesting.release(msg.sender);
    }

    /**
     * @dev Source of tokens. Override this method to modify the way in which the crowdsale ultimately gets and sends
     * its tokens.
     * @param beneficiary Address performing the token purchase
     * @param tokenAmount Number of tokens to be emitted
     */
    function _deliverTokens(address beneficiary, uint256 tokenAmount) internal {
        token().approve(address(_tokenVesting), tokenAmount);

        _tokenVesting.vest(beneficiary, tokenAmount);
    }

    /**
     * @dev Calculates total token amount that has not been sold.
     */
    function _remainingAmount() private view returns (uint256) {
        return token().balanceOf(address(this));
    }
}
