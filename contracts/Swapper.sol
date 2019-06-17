pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";

contract Swapper is ERC20 {
    using SafeMath for uint256;

    uint256 public initialSupply;

    IERC20 public PTON;
    IERC20 public MTON;
    ERC20Mintable public TON;

    uint256 public swapMTONRate;
    uint256 public swapPTONRate;

    constructor (uint256 _initialSupply, IERC20 _PTON, IERC20 _MTON, ERC20Mintable _TON) public {
        require(_initialSupply != 0, "Swapper: initial supply is zero");
        require(address(_PTON) != address(0) && address(_MTON) != address(0) && address(_TON) != address(0), "Swapper: zero address");
        initialSupply = _initialSupply;
        swapPTONRate = _initialSupply.div(100);
        swapMTONRate = _initialSupply.div(1000000);

        PTON = _PTON;
        MTON = _MTON;
        TON = _TON;
    }

    function swapFromPTON() external {
        uint256 allowance = PTON.allowance(msg.sender, address(this));
        require(allowance != 0, "Swapper: allowance is zero");

        require(PTON.transferFrom(msg.sender, address(this), allowance), "Swapper: transferFrom reverts");
        TON.mint(msg.sender, allowance.mul(swapPTONRate));
    }

    function swapFromMTON() external {
        uint256 allowance = MTON.allowance(msg.sender, address(this));
        require(allowance != 0, "Swapper: allowance is zero");

        require(MTON.transferFrom(msg.sender, address(this), allowance), "Swapper: transferFrom reverts");
        TON.mint(msg.sender, allowance.mul(swapMTONRate));
    }
}
