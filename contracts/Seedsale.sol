pragma solidity ^0.5.0;

import "./openzeppelin-solidity/token/ERC20/IERC20.sol";
import "./openzeppelin-solidity/crowdsale/validation/CappedCrowdsale.sol";
import "./openzeppelin-solidity/crowdsale/validation/IndividuallyCappedCrowdsale.sol";
import "./openzeppelin-solidity/crowdsale/validation/WhitelistCrowdsale.sol";

contract Seedsale is IndividuallyCappedCrowdsale, CappedCrowdsale, WhitelistCrowdsale {
    // Used for rate calcuration.
    uint256 private _numerator;
    uint256 private _denominator;

    constructor (uint256 numerator, uint256 denominator, address payable wallet, IERC20 _token, uint256 _cap)
        public
        Crowdsale(1, wallet, _token)
        CappedCrowdsale(_cap)
    {
        require(numerator != 0 && denominator != 0, "Seedsale: get zero value");
        require(numerator >= denominator, "Seedsale: denominator is more than numerator");

        _numerator = numerator;
        _denominator = denominator;
    }

    /**
     * @return the number of token units a buyer gets per wei.
     */
    function rate() public view returns (uint256) {
        return super.rate().mul(_numerator).div(_denominator);
    }

    /**
     * @dev Override to extend the way in which ether is converted to tokens.
     * @param weiAmount Value in wei to be converted into tokens
     * @return Number of tokens that can be purchased with the specified _weiAmount
     */
    function _getTokenAmount(uint256 weiAmount) internal view returns (uint256) {
        return weiAmount.mul(rate());
    }

    /**
     * @dev Extend parent behavior requiring purchase to respect the beneficiary's funding cap.
     * @param beneficiary Token purchaser
     * @param weiAmount Amount of wei contributed
     */
    function _preValidatePurchase(address beneficiary, uint256 weiAmount) internal view {
        // solhint-disable-next-line max-line-length
        require(getContribution(beneficiary).add(weiAmount) == getCap(beneficiary), "Seedsale: wei amount is not exact");

        super._preValidatePurchase(beneficiary, weiAmount);
    }
}