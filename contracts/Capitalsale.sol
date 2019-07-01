pragma solidity ^0.5.0;

import "./openzeppelin-solidity/token/ERC20/IERC20.sol";
import "./openzeppelin-solidity/crowdsale/validation/CappedCrowdsale.sol";
import "./openzeppelin-solidity/crowdsale/validation/WhitelistCrowdsale.sol";

contract Capitalsale is CappedCrowdsale, WhitelistCrowdsale {
    uint256 private _individualMinCap;
    uint256 private _individualMaxCap;

    mapping(address => uint256) private _contributions;

    constructor (uint256 rate, address payable wallet, IERC20 _token, uint256 _cap, uint256 individualMinCap, uint256 individualMaxCap)
        public
        Crowdsale(rate, wallet, _token)
        CappedCrowdsale(_cap)
    {
        require(individualMinCap != 0 && individualMaxCap != 0, "Capitalsale: individual cap value is zero");
        require(individualMinCap <= individualMaxCap, "Capitalsale: min cap is more than max cap");

        _individualMinCap = individualMinCap;
        _individualMaxCap = individualMaxCap;
    }

    /**
     * @dev Returns individual min cap.
     * @return Individual min cap
     */
    function individualMinCap() public view returns (uint256) {
        return _individualMinCap;
    }

    /**
     * @dev Returns individual max cap.
     * @return Individual max cap
     */
    function individualMaxCap() public view returns (uint256) {
        return _individualMaxCap;
    }

    /**
     * @dev Returns the amount contributed so far by a specific beneficiary.
     * @param beneficiary Address of contributor
     * @return Beneficiary contribution so far
     */
    function getContribution(address beneficiary) public view returns (uint256) {
        return _contributions[beneficiary];
    }

     /**
     * @dev Extend parent behavior requiring purchase to respect the beneficiary's funding cap.
     * @param beneficiary Token purchaser
     * @param weiAmount Amount of wei contributed
     */
    function _preValidatePurchase(address beneficiary, uint256 weiAmount) internal view {
        super._preValidatePurchase(beneficiary, weiAmount);
        require(_contributions[beneficiary].add(weiAmount) >= _individualMinCap, "Capitalsale: less than individual min cap");
        require(_contributions[beneficiary].add(weiAmount) <= _individualMaxCap, "Capitalsale: more than individual max cap");
    }

    /**
     * @dev Extend parent behavior to update beneficiary contributions.
     * @param beneficiary Token purchaser
     * @param weiAmount Amount of wei contributed
     */
    function _updatePurchasingState(address beneficiary, uint256 weiAmount) internal {
        super._updatePurchasingState(beneficiary, weiAmount);
        _contributions[beneficiary] = _contributions[beneficiary].add(weiAmount);
    }
}