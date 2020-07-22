pragma solidity ^0.5.0;

import "./openzeppelin-solidity/token/ERC20/ERC20Mintable.sol";
import "./openzeppelin-solidity/math/SafeMath.sol";
import "./openzeppelin-solidity/ownership/Secondary.sol";
import "./VestingToken.sol";

contract Swapper is Secondary {
    using SafeMath for uint256;

    mapping(address => uint256) public rate;

    ERC20Mintable public _token;

    event Swapped(address account, uint256 unreleased, uint256 transferred);
    event Withdrew(address recipient, uint256 amount);

    constructor (ERC20Mintable token) public {
        _token = token;
    }

    function updateRate(address vestingToken, uint256 tokenRate) external onlyPrimary {
        rate[vestingToken] = tokenRate;
    }

    function swap (VestingToken vestingToken) external returns (bool) {
        require(rate[address(vestingToken)] != 0, "Swapper: not valid sale token address");

        uint256 rate = rate[address(vestingToken)];
        uint256 unreleased = vestingToken.destroyReleasableTokens(msg.sender);

        uint256 amount = unreleased.mul(rate);
        _token.transfer(msg.sender, amount);

        emit Swapped(msg.sender, unreleased, amount);
        return true;
    }

    function releasableAmount(VestingToken vestingToken, address beneficiary) external view returns (uint256) {
        return vestingToken.releasableAmount(beneficiary);
    }

    function changeController (VestingToken vestingToken, address payable newController) external onlyPrimary {
        vestingToken.changeController(newController);
    }

    function withdraw(address payable recipient, uint amount256) external onlyPrimary {
        _token.transfer(recipient, amount256);
        emit Withdrew(recipient, amount256);
    }
}
