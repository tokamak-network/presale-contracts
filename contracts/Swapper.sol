pragma solidity ^0.5.0;

import "./openzeppelin-solidity/token/ERC20/ERC20Mintable.sol";
import "./openzeppelin-solidity/math/SafeMath.sol";
import "./openzeppelin-solidity/ownership/Secondary.sol";
import "./VestingToken.sol";

contract Swapper is Secondary {
    using SafeMath for uint256;

    uint256 constant public SEED_RATE = 1;
    uint256 constant public PRIVATE_RATE = 2;
    uint256 constant public STRATEGIC_RATE = 3;

    // address constant public SEED_TON = 0x8Ae43F11DDd3fac5bbD84ab0BA795E1e51b78df7;
    // address constant public PRIVATE_TON = 0x2C0F8e85ad3DCbEc1561f6cE632DFF86294e479f;
    // address constant public STRATEGIC_TON = 0x2801265c6f888f5a9e1b72ee175fc0091e007080;

    address public SEED_TON;
    address public PRIVATE_TON;
    address public STRATEGIC_TON;

    ERC20Mintable public _token;

    event Swapped(address account, uint256 unreleased, uint256 transferred);

    constructor (ERC20Mintable token, address seedTON, address privateTON, address strategicTON) public {
        _token = token;

        SEED_TON = seedTON;
        PRIVATE_TON = privateTON;
        STRATEGIC_TON = strategicTON;
    }

    function swap (VestingToken vestingToken) external returns (bool) {
        require(
            address(vestingToken) == SEED_TON ||
            address(vestingToken) == PRIVATE_TON ||
            address(vestingToken) == STRATEGIC_TON,
            "Swapper: not valid sale token address"
        );

        uint256 rate = rate(address(vestingToken));
        uint256 unreleased = vestingToken.destroyReleasableTokens(msg.sender);

        uint256 amount = unreleased.mul(rate);
        _token.transfer(msg.sender, amount);

        emit Swapped(msg.sender, unreleased, amount);
        return true;
    }

    function rate (address vestingToken) public view returns (uint256) {
        if (vestingToken == SEED_TON) return SEED_RATE;
        else if (vestingToken == PRIVATE_TON) return PRIVATE_RATE;
        else if (vestingToken == STRATEGIC_TON) return STRATEGIC_RATE;
        else return 0;
    }

    function releasableAmount(VestingToken vestingToken, address beneficiary) external view returns (uint256) {
        return vestingToken.releasableAmount(beneficiary);
    }

    function changeController (VestingToken vestingToken, address payable newController) external onlyPrimary {
        vestingToken.changeController(newController);
    }
}
