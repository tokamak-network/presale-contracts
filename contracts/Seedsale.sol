pragma solidity ^0.5.0;

import "./TokenVestingCrowdsale.sol";
import "./openzeppelin-solidity/token/ERC20/IERC20.sol";
import "./openzeppelin-solidity/payment/escrow/RefundEscrow.sol";
import "./openzeppelin-solidity/crowdsale/validation/CappedCrowdsale.sol";
import "./openzeppelin-solidity/crowdsale/validation/IndividuallyCappedCrowdsale.sol";
import "./openzeppelin-solidity/crowdsale/validation/WhitelistCrowdsale.sol";
import "./openzeppelin-solidity/crowdsale/distribution/FinalizableCrowdsale.sol";

contract Seedsale is IndividuallyCappedCrowdsale, CappedCrowdsale, WhitelistCrowdsale, TokenVestingCrowdsale {
    constructor (uint256 _rate, address payable wallet, IERC20 _token, uint256 _cap)
        public
        Crowdsale(_rate, wallet, _token)
        CappedCrowdsale(_cap)
    {
        // solhint-disable-previous-line no-empty-blocks
    }

    /**
     * @dev Extend parent behavior requiring purchase to respect the beneficiary's funding cap.
     * @param beneficiary Token purchaser
     * @param weiAmount Amount of wei contributed
     */
    function _preValidatePurchase(address beneficiary, uint256 weiAmount) internal view {
        super._preValidatePurchase(beneficiary, weiAmount);
        // solhint-disable-next-line max-line-length
        require(getContribution(beneficiary).add(weiAmount) == getCap(beneficiary), "Seedsale: wei amount is not exact");
    }
}