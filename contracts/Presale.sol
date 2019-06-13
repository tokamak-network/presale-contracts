pragma solidity ^0.5.0;

import 'openzeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol';
import 'openzeppelin-solidity/contracts/crowdsale/validation/WhitelistCrowdsale.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/IERC20.sol';

contract Presale is WhitelistCrowdsale, CappedCrowdsale {

    uint256 private individualCap;
    mapping(address => uint256) private contributions;
    uint256 private individualMinCap;
    uint256 private individualMaxCap;

    constructor (uint256 _rate, address payable _wallet, IERC20 _token, uint256 _cap, uint256 _individualCap)
        uint256 _individualMinCap,
        uint256 _individualMaxCap
        public
        Crowdsale(_rate, _wallet, _token)
        CappedCrowdsale(_cap)
    {
        individualCap = _individualCap;
        individualMinCap = _individualMinCap;
        individualMaxCap = _individualMaxCap;
    }

    function setIndividualMinCap(uint256 newIndividualMinCap) external onlyWhitelistAdmin {
        individualMinCap = newIndividualMinCap;
    }

    function setIndividualMaxCap(uint256 newIndividualMaxCap) external onlyWhitelistAdmin {
        individualMaxCap = newIndividualMaxCap;
    }

    function getIndividualMinCap() public view returns (uint256) {
        return individualMinCap;
    }

    function getIndividualMaxCap() public view returns (uint256) {
        return individualMaxCap;
    }


    }

    /**
     * @dev Returns the cap of a individual cap.
     * @return Current individual cap
     */
    function getIndividualCap() public view returns (uint256) {
        return individualCap;
    }

    /**
     * @dev Extend parent behavior requiring purchase to respect the beneficiary's funding cap.
     * @param beneficiary Token purchaser
     * @param weiAmount Amount of wei contributed
     */
    function _preValidatePurchase(address beneficiary, uint256 weiAmount) internal view {
        super._preValidatePurchase(beneficiary, weiAmount);

        uint256 individualWeiAmount = contributions[beneficiary].add(weiAmount);
        require(individualWeiAmount >= individualMinCap, "Presale: Less than min cap");
        require(individualWeiAmount <= individualMaxCap, "Presale: More than max cap");
    }

    /**
     * @dev Extend parent behavior to update beneficiary contributions.
     * @param beneficiary Token purchaser
     * @param weiAmount Amount of wei contributed
     */
    function _updatePurchasingState(address beneficiary, uint256 weiAmount) internal {
        super._updatePurchasingState(beneficiary, weiAmount);
        contributions[beneficiary] = contributions[beneficiary].add(weiAmount);
    }
}
