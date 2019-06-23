pragma solidity ^0.5.0;

import "./TokenVesting.sol";
import "./openzeppelin-solidity/token/ERC20/IERC20.sol";
import "./openzeppelin-solidity/crowdsale/Crowdsale.sol";

contract TokenVestingCrowdsale is Crowdsale {

    TokenVesting private _tokenVesting;

    bool private _initiated;

    constructor () public {
        _tokenVesting = new TokenVesting(token());
    }

    /**
     * @dev Returns true if the token can be released, and false otherwise.
     */
    function initiated() public view returns (bool) {
        return _initiated;
    }

    /**
     * @notice Initiate vesting period, only if there are no remaining tokens.
     * @param start the time (as Unix time) at which point vesting starts
     * @param cliffDuration duration in seconds of the cliff in which tokens will begin to vest
     * @param duration duration in seconds of the period in which the tokens will vest
     */
    function initiate(uint256 start, uint256 cliffDuration, uint256 duration) public {
        require(!_initiated, "TokenVestingCrowdsale: already initiated");
        require(_remainingAmount() == 0, "TokenVestingCrowdsale: all tokens have not been sold yet");

        _tokenVesting.initiate(start, cliffDuration, duration);

        _initiated = true;
    }

    /**
     * @notice Vested beneficiary's tokens.
     * @param token token to vest.
     * @param beneficiary the beneficiary of the tokens.
     * @param amount vesting token amount.
     */
    function _vesting(IERC20 token, address beneficiary, uint256 amount) internal {
        token.approve(address(_tokenVesting), amount);

        _tokenVesting.vesting(beneficiary, amount);
    }

    /**
     * @notice Transfers vested tokens to beneficiary.
     * @param beneficiary the beneficiary of the tokens.
     */
    function release(address beneficiary) public {
        _tokenVesting.release(beneficiary);
    }

    /**
     * @dev Source of tokens. Override this method to modify the way in which the crowdsale ultimately gets and sends
     * its tokens.
     * @param beneficiary Address performing the token purchase
     * @param tokenAmount Number of tokens to be emitted
     */
    function _deliverTokens(address beneficiary, uint256 tokenAmount) internal {
        _vesting(token(), beneficiary, tokenAmount);
    }

    /**
     * @dev Calculates total token amount that has not been sold.
     */
    function _remainingAmount() private view returns (uint256) {
        return token().balanceOf(address(this));
    }
}