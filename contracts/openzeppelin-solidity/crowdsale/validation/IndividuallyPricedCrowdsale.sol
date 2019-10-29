pragma solidity ^0.5.0;

import "../../math/SafeMath.sol";
import "../Crowdsale.sol";
import "../../access/roles/CapperRole.sol";

/**
 * @title IndividuallyPricedCrowdsale
 * @dev Crowdsale with per-purchaser prices.
 */
contract IndividuallyPricedCrowdsale is Crowdsale, CapperRole {
    using SafeMath for uint256;

    mapping(address => uint256) private _numerators;
    mapping(address => uint256) private _denominators;

    event PriceSet(address indexed purchaser, uint256 numerator, uint256 denominator);

    /**
     * @dev Sets a specific purchaser's price parameters.
     * @param purchaser Address to be priced
     * @param numerator A numerator for price parameter
     * @param denominator A denominator for price parameter
     */
    function setPrice(address purchaser, uint256 numerator, uint256 denominator) public onlyCapper {
        require(_numerators[purchaser] == 0 && _denominators[purchaser] == 0, "IndividuallyPricedCrowdsale: price was already set");
        require(numerator != 0, "IndividuallyPricedCrowdsale: numerator cannot be zero");
        require(denominator != 0, "IndividuallyPricedCrowdsale: denominator cannot be zero");

        _denominators[purchaser] = denominator;
        _numerators[purchaser] = numerator;

        emit PriceSet(purchaser, denominator, numerator);
    }

    function getNumerator(address purchaser) public view returns (uint256) {
        return _numerators[purchaser];
    }

    function getDenominator(address purchaser) public view returns (uint256) {
        return _denominators[purchaser];
    }

    /**
     * @dev Validation of purchase.
     * @param beneficiary Address whose cap is to be checked
     * @param weiAmount Value in wei to be converted into tokens
     */
    function _preValidatePurchase(address beneficiary, uint256 weiAmount) internal view {
        // solhint-disable-next-line max-line-length
        require(_numerators[msg.sender] != 0 && _denominators[msg.sender] != 0, "IndividuallyPricedCrowdsale: the price of purchaser must be set");

        super._preValidatePurchase(beneficiary, weiAmount);
    }

    /**
     * @dev Calculate the amount of tokens, given numerator and denominator for the purchaser.
     * @param weiAmount Value in wei to be converted into tokens
     * @return Number of tokens that can be purchased with the specified _weiAmount
     */
    function _getTokenAmount(uint256 weiAmount) internal view returns (uint256) {
        uint256 pricedWeiAmount = weiAmount.mul(_numerators[msg.sender]).div(_denominators[msg.sender]);
        return super._getTokenAmount(pricedWeiAmount);
    }
}
