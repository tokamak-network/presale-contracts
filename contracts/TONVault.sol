pragma solidity ^0.5.0;

import "./openzeppelin-solidity/token/ERC20/ERC20Mintable.sol";
import "./openzeppelin-solidity/math/SafeMath.sol";
import "./openzeppelin-solidity/ownership/Secondary.sol";

contract TONVault is Secondary {
    using SafeMath for uint256;

    modifier onlyWithdrawableTime() {
        require(block.timestamp > withdrawableTime, "TONVault: not withdrawable time");
        _;
    }
    
    ERC20Mintable public ton;
    uint256 public withdrawableTime;

    constructor (ERC20Mintable tonToken, uint256 withdrawableTimestamp) public {
        ton = tonToken;
        withdrawableTime = withdrawableTimestamp;
    }

    function setApprovalAmount(address approval, uint256 amount) public onlyPrimary {
        ton.approve(approval, amount);
    }
    
    // TODO: 40개월 이전에는 withdraw 호출 금지
    function withdraw(uint256 amount, address recipient) public onlyPrimary onlyWithdrawableTime {
        ton.transfer(recipient, amount);
    }
}
