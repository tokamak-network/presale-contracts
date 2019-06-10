pragma solidity ^0.5.0;

import 'openzeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol';
import 'openzeppelin-solidity/contracts/crowdsale/validation/WhitelistCrowdsale.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/IERC20.sol';

contract Presale is WhitelistCrowdsale, CappedCrowdsale {

    uint256 private individualCap;
    mapping(address => uint256) private contributions;

    constructor (uint256 _rate, address payable _wallet, IERC20 _token, uint256 _cap, uint256 _individualCap)
        public
        Crowdsale(_rate, _wallet, _token)
        CappedCrowdsale(_cap)
    {
        individualCap = _individualCap;
    }

    function setIndividualCap(uint256 newIndividualCap) external onlyWhitelistAdmin {
        individualCap = newIndividualCap;
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
        // solhint-disable-next-line max-line-length
        require(contributions[beneficiary].add(weiAmount) <= individualCap, "Presale: beneficiary's individual cap exceeded");
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
