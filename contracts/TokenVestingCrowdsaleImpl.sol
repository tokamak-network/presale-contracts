pragma solidity ^0.5.0;

import "./TokenVestingCrowdsale.sol";
import "./openzeppelin-solidity/crowdsale/Crowdsale.sol";

contract TokenVestingCrowdsaleImpl is TokenVestingCrowdsale {
    constructor (uint256 rate, address payable wallet, IERC20 token)
        public
        Crowdsale(rate, wallet, token)
    {
        // solhint-disable-previous-line no-empty-blocks
    }
}
