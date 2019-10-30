pragma solidity ^0.5.0;

import "./openzeppelin-solidity/token/ERC20/IERC20.sol";
import "./openzeppelin-solidity/crowdsale/validation/IndividuallyPricedCrowdsale.sol";
import "./openzeppelin-solidity/crowdsale/validation/CappedCrowdsale.sol";
import "./openzeppelin-solidity/crowdsale/validation/IndividuallyCappedCrowdsale.sol";
import "./openzeppelin-solidity/crowdsale/validation/WhitelistCrowdsale.sol";

contract Privatesale is WhitelistCrowdsale, IndividuallyCappedCrowdsale, IndividuallyPricedCrowdsale {
    uint256 public smallPayment = 3e16; // 0.03 ether

    constructor (address payable wallet, IERC20 token)
        public
        Crowdsale(1, wallet, token)
    {}

    function setCapAndPrice(
        address purchaser,
        uint256 cap,
        uint256 price
    ) public {
        addWhitelisted(purchaser);
        setCap(purchaser, cap);
        setPrice(purchaser, price);
    }

    /**
     * @dev Only accept payment if wei amount is equal to 0.03 ether or the purchaser cap
     * @param beneficiary Token purchaser
     * @param weiAmount Amount of wei contributed
     */
    function _preValidatePurchase(address beneficiary, uint256 weiAmount) internal view {
        super._preValidatePurchase(beneficiary, weiAmount);

        require(msg.sender == beneficiary, "Privatesale: beneficiary must be msg sender");

        uint256 amount = getContribution(beneficiary).add(weiAmount);
        require(amount == smallPayment || amount == getCap(beneficiary), "Privatesale: wei amount should be equal to purchaser cap or equal to 0.03 ether");

    }
}
