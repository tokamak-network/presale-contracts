pragma solidity ^0.5.0;

import "./openzeppelin-solidity/token/ERC20/ERC20Mintable.sol";
import "./openzeppelin-solidity/math/SafeMath.sol";
import "./openzeppelin-solidity/ownership/Secondary.sol";

contract TONVault is Secondary {
    using SafeMath for uint256;

    ERC20Mintable public ton;
    uint256 public withdrawableTime;

    constructor (ERC20Mintable tonToken) public {
        ton = tonToken;
    }

    function setApprovalAmount(address approval, uint256 amount) public onlyPrimary {
        ton.approve(approval, amount);
    }
    
    function withdraw(uint256 amount, address recipient) public onlyPrimary {
        ton.transfer(recipient, amount);
    }
}
