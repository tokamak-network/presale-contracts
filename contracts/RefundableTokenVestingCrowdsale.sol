pragma solidity ^0.5.0;

import "./RefundableTokenVesting.sol";
import "./TokenVestingCrowdsale.sol";
import "./openzeppelin-solidity/token/ERC20/IERC20.sol";
import "./openzeppelin-solidity/crowdsale/Crowdsale.sol";

contract RefundableTokenVestingCrowdsale is TokenVestingCrowdsale {
    using SafeMath for uint256;

    /**
     * @notice Transfers vested tokens to beneficiary or refunds.
     * @param refund true, beneficiary want to refund, false if not.
     */
    function release(bool refund) public {
        if (refund) {
            uint256 refunded = tokenVesting().refund(msg.sender);
            msg.sender.transfer(refunded.div(rate()));
        } else {
            uint256 unreleased = release();
            wallet().transfer(unreleased.mul(rate()));
        }
    }

    /**
     * @dev Overrides Crowdsale fund forwarding.
     */
    function _forwardFunds(uint256 amount) internal {
        // solhint-disable-previous-line no-empty-blocks
    }
}
