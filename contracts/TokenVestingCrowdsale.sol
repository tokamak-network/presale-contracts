pragma solidity ^0.5.0;

import "./RefundableTokenVesting.sol";
import "./openzeppelin-solidity/ownership/Ownable.sol";
import "./openzeppelin-solidity/token/ERC20/IERC20.sol";
import "./openzeppelin-solidity/crowdsale/Crowdsale.sol";

contract TokenVestingCrowdsale is Crowdsale, Ownable {
    RefundableTokenVesting private _tokenVesting;

    constructor () public {
        _tokenVesting = new RefundableTokenVesting(address(0), token());
    }

    /**
     * @dev Returns contract that token vests.
     */
    function tokenVesting() public view returns (RefundableTokenVesting) {
        return _tokenVesting;
    }

    /**
     * @notice Initiate vesting period, only if there are no remaining tokens.
     * @param start the time (as Unix time) at which point vesting starts
     * @param cliffDuration duration in seconds of the cliff in which tokens will begin to vest
     * @param duration duration in seconds of the period in which the tokens will vest
     */
    function initiate(uint256 start, uint256 cliffDuration, uint256 duration) public onlyOwner {
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
     * @dev Gets remaining token amount.
     */
    function _remainingAmount() private view returns (uint256) {
        return token().balanceOf(address(this));
    }

    /**
     * @dev Gets token amount in vesting contract.
     */
    function _vestingAmount() private view returns (uint256) {
        return token().balanceOf(address(_tokenVesting));
    }
}
