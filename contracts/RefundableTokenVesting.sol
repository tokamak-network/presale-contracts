pragma solidity ^0.5.0;

import "./TokenVesting.sol";
import "./openzeppelin-solidity/token/ERC20/IERC20.sol";

contract RefundableTokenVesting is TokenVesting {
    address private _refundee; // One who receives a refund.

    constructor (address refundee, IERC20 token) public TokenVesting(token) {
        _refundee = refundee;
    }

    /**
     * @dev Returns refundee address.
     */
    function refundee() public view returns (address) {
        return _refundee;
    }

    /**
     * @dev Refunds from vested token to wei.
     * @param refunder One who refunds.
     */
    function refund(address refunder) public onlyPrimary returns (uint256) {
        return _refund(refunder, _refundee);
    }
}
