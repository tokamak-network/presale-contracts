pragma solidity ^0.5.0;

import "./openzeppelin-solidity/token/ERC20/ERC20Mintable.sol";
import "./openzeppelin-solidity/math/SafeMath.sol";
import "./openzeppelin-solidity/ownership/Secondary.sol";

contract TONVault is Secondary {
    using SafeMath for uint256;
    
    ERC20Mintable public ton;
    //mapping(address => bool) public approvers;

    /*modifier onlyApprovers() {
        require(approvers[msg.sender], "TONVault: caller is not an approver");
        _;
    }*/

    constructor (ERC20Mintable tonToken) public {
        ton = tonToken;
    }

    /*function addApprover(address newApprover) public onlyPrimary {
        approvers[newApprover] = true;
    }

    function delApprover(address approver) public onlyPrimary {
        approvers[approver] = false;
    }*/

    function setApprovalAmount(address approval, uint256 amount) public onlyPrimary {
        ton.approve(approval, amount);
    }

    function withdraw(uint256 amount, address recipient) public onlyPrimary {
        ton.transfer(recipient, amount);
    }
}
