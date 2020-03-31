pragma solidity ^0.5.0;

// import "../../math/SafeMath.sol";
import "../Crowdsale.sol";
import "../../access/roles/CapperRole.sol";
import "../../../ds/ds-math.sol";

/**
 * @title IndividuallyPricedCrowdsale
 * @dev Crowdsale with per-purchaser prices.
 */
contract IndividuallyPricedCrowdsale is Crowdsale, CapperRole, DSMath {
    // using SafeMath for uint256;

    // _prices should be a WAD value.
    mapping(address => uint256) private _prices;

    event PriceSet(address indexed purchaser, uint256 price);

    /**
     * @dev Sets a specific purchaser's price parameters.
     * @param purchaser Address to be priced
     * @param price Price value in WAD
     */
    function setPrice(address purchaser, uint256 price) public onlyCapper {
        require(_prices[purchaser] == 0, "IndividuallyPricedCrowdsale: price was already set");
        require(price != 0, "IndividuallyPricedCrowdsale: price cannot be zero");

        _prices[purchaser] = price;

        emit PriceSet(purchaser, price);
    }

    function getPrice(address purchaser) public view returns (uint256) {
        return _prices[purchaser];
    }

    /**
     * @dev Validation of purchase.
     * @param beneficiary Address whose cap is to be checked
     * @param weiAmount Value in wei to be converted into tokens
     */
    function _preValidatePurchase(address beneficiary, uint256 weiAmount) internal view {
        // solhint-disable-next-line max-line-length
        require(_prices[msg.sender] != 0, "IndividuallyPricedCrowdsale: the price of purchaser must be set");

        super._preValidatePurchase(beneficiary, weiAmount);
    }

    /**
     * @dev Calculate the amount of tokens, given numerator and denominator for the purchaser.
     * @param weiAmount Value in wei to be converted into tokens
     * @return Number of tokens that can be purchased with the specified _weiAmount
     */
    function _getTokenAmount(uint256 weiAmount) internal view returns (uint256) {
        uint256 price = _prices[msg.sender];
        uint256 pricedWeiAmount = wmul(price, weiAmount);
        return super._getTokenAmount(pricedWeiAmount);
    }
}
