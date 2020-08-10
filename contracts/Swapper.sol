pragma solidity ^0.5.0;

import "./openzeppelin-solidity/token/ERC20/ERC20Mintable.sol";
import "./openzeppelin-solidity/token/ERC20/IERC20.sol";
import "./openzeppelin-solidity/math/SafeMath.sol";
import "./openzeppelin-solidity/ownership/Secondary.sol";
import "./VestingTokenStep.sol";
import "./TONVault.sol";
import "./Burner.sol";

contract Swapper is Secondary {
    using SafeMath for uint256;

    mapping(address => uint256) public ratio;

    ERC20Mintable public _token;
    IERC20 public mton;
    TONVault public vault;
    address public constant burner = 0x0000000000000000000000000000000000000001;
    uint256 public startTimestamp;

    event Swapped(address account, uint256 unreleased, uint256 transferred);
    event Withdrew(address recipient, uint256 amount);
    event UpdateRatio(address vestingToken, uint256 tokenRatio);
    event SetVault(address vaultAddress);

    modifier onlyBeforeStart() {
        require(block.timestamp < startTimestamp || startTimestamp == 0, "Swapper: cannot execute after start");
        _;
    }

    constructor (ERC20Mintable token, address mtonAddress) public {
        _token = token;
        mton = IERC20(mtonAddress);
    }

    function updateRatio(address vestingToken, uint256 tokenRatio) external onlyPrimary onlyBeforeStart {
        ratio[vestingToken] = tokenRatio;
        emit UpdateRatio(vestingToken, tokenRatio);
    }

    function setStart(uint256 _startTimestamp) external onlyPrimary {
        require(startTimestamp == 0, "Swapper: the starttime is already set");
        startTimestamp = _startTimestamp;
    }

    function swap(address payable vestingToken) external returns (bool) {
        uint256 tokenRatio = ratio[vestingToken];
        require(tokenRatio != 0, "VestingSwapper: not valid sale token address");

        uint256 unreleased = releasableAmount(vestingToken, msg.sender);
        if (unreleased == 0) {
            return true;
        }

        if (vestingToken == address(mton)) {
            mton.transferFrom(msg.sender, address(this), unreleased);
            mton.transfer(burner, unreleased);
        } else {
            unreleased = VestingTokenStep(vestingToken).destroyReleasableTokens(msg.sender);
        }
        uint256 ton_amount = unreleased.mul(tokenRatio);
        _token.transferFrom(address(vault), address(this), ton_amount);
        _token.transfer(msg.sender, ton_amount);
        
        emit Swapped(msg.sender, unreleased, ton_amount);
        return true;
    }

    // TokenController

    /// @notice Called when `_owner` sends ether to the MiniMe Token contract
    /// @param _owner The address that sent the ether to create tokens
    /// @return True if the ether is accepted, false if it throws
    function proxyPayment(address _owner) public payable returns(bool) {
        return true;
    }

    /// @notice Notifies the controller about a token transfer allowing the
    ///  controller to react if desired
    /// @param _from The origin of the transfer
    /// @param _to The destination of the transfer
    /// @param _amount The amount of the transfer
    /// @return False if the controller does not authorize the transfer
    function onTransfer(address _from, address _to, uint _amount) public returns(bool) {
        return true;
    }

    /// @notice Notifies the controller about an approval allowing the
    ///  controller to react if desired
    /// @param _owner The address that calls `approve()`
    /// @param _spender The spender in the `approve()` call
    /// @param _amount The amount in the `approve()` call
    /// @return False if the controller does not authorize the approval
    function onApprove(address _owner, address _spender, uint _amount) public returns(bool) {
        return true;
    }

    function releasableAmount(address payable vestingToken, address beneficiary) public view returns (uint256) {
        if (vestingToken == address(mton)) {
            return mton.balanceOf(beneficiary);
        } else {
            return VestingTokenStep(vestingToken).releasableAmount(beneficiary);
        }
    }

    function changeController(VestingTokenStep vestingToken, address payable newController) external onlyPrimary {
        vestingToken.changeController(newController);
    }

    function setVault(TONVault vaultAddress) external onlyPrimary {
        vault = vaultAddress;
        emit SetVault(address(vaultAddress));
    }
}
