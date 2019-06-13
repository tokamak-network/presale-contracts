pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";

contract Swapper is ERC20 {
    using SafeMath for uint256;

    // number of tokens sold at public sale
    uint256 private initialSupply;

    uint256 public swapRate;

    constructor (uint256 _initialSupply) public {
        initialSupply = _initialSupply;
        swapRate = _initialSupply.div(100);
    }

    function swap(IERC20 PTON, ERC20Mintable TON) external {
        uint256 allowance = PTON.allowance(msg.sender, address(this));
        require(allowance != 0, "Swapper: allowance is zero"); 

        PTON.transferFrom(msg.sender, address(this), allowance);
        TON.mint(msg.sender, allowance.mul(swapRate));
    }
}
