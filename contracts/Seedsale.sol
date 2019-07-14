pragma solidity ^0.5.0;

import "./openzeppelin-solidity/token/ERC20/IERC20.sol";
import "./openzeppelin-solidity/crowdsale/validation/CappedCrowdsale.sol";
import "./openzeppelin-solidity/crowdsale/validation/IndividuallyCappedCrowdsale.sol";
import "./openzeppelin-solidity/crowdsale/validation/WhitelistCrowdsale.sol";

contract Seedsale is IndividuallyCappedCrowdsale, CappedCrowdsale, WhitelistCrowdsale {
    // Used for rate calcuration. So rate value must be 1.
    uint256 private _numerator;
    uint256 private _denominator;

    uint256 private _minCap;

    constructor (uint256 numerator, uint256 denominator, address payable wallet, IERC20 token, uint256 cap, uint256 minCap)
        public
        Crowdsale(1, wallet, token)
        CappedCrowdsale(cap)
    {
        require(numerator != 0 && denominator != 0, "Seedsale: get zero value");
        require(numerator >= denominator, "Seedsale: denominator is more than numerator");

        _numerator = numerator;
        _denominator = denominator;

        require(minCap > 0, "Seedsale: min cap is 0");
        _minCap = minCap;
    }

    function minCap() public view returns (uint256) {
        return _minCap;
    }
    function numerator() public view returns (uint256) {
        return _numerator;
    }
    function denominator() public view returns (uint256) {
        return _denominator;
    }

    /**
     * @dev Override to extend the way in which ether is converted to tokens.
     * @param weiAmount Value in wei to be converted into tokens
     * @return Number of tokens that can be purchased with the specified _weiAmount
     */
    function _getTokenAmount(uint256 weiAmount) internal view returns (uint256) {
        return weiAmount.mul(_numerator).div(_denominator);
    }

    /**
     * @dev Extend parent behavior requiring purchase to respect the beneficiary's funding cap.
     * @param beneficiary Token purchaser
     * @param weiAmount Amount of wei contributed
     */
    function _preValidatePurchase(address beneficiary, uint256 weiAmount) internal view {
        uint256 amount = getContribution(beneficiary).add(weiAmount);
        require(amount >= _minCap, "Seedsale: wei amount is less than min cap");
        require(amount == getCap(beneficiary), "Seedsale: wei amount is not exact");

        super._preValidatePurchase(beneficiary, weiAmount);
    }
}