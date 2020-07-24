pragma solidity ^0.5.0;

import "./openzeppelin-solidity/token/ERC20/ERC20Mintable.sol";
import "./openzeppelin-solidity/token/ERC20/IERC20.sol";
import "./openzeppelin-solidity/math/SafeMath.sol";
import "./openzeppelin-solidity/ownership/Secondary.sol";
import "./VestingToken.sol";
import "./TONVault.sol";

contract VestingSwapper is Secondary {
    using SafeMath for uint256;

    uint256 constant UNIT_IN_SECONDS = 60 * 60 * 24 * 30;

    struct BeneficiaryInfo {
        uint256 totalAmount; // total deposit amount
        uint256 releasedAmount; // released amount
    }

    struct VestingInfo {
        bool isInitiated;
        uint256 start; // start timestamp
        uint256 cliff; // cilff timestamp
        uint256 firstClaimTimestamp; // the timestamp of the first claim
        uint256 firstClaimAmount; // the first claim amount of the VestingToken
        uint256 durationUnit; // duration unit
        uint256 durationInSeconds; // duration in seconds
        uint256 ratio;
        uint256 initialTotalSupply; // totalSupply of the VestingToken when initiated
    }

    // (VestingToken => (beneficiary => info))
    mapping(address => mapping(address => BeneficiaryInfo)) public beneficiaryInfo;

    // VestingToken => info
    mapping(address => VestingInfo) public vestingInfo;

    ERC20Mintable public _token;
    TONVault public vault;

    event Swapped(address account, uint256 unreleased, uint256 transferred);
    event Withdrew(address recipient, uint256 amount);

    modifier beforeInitiated(address vestingToken) {
        require(!vestingInfo[vestingToken].isInitiated, "VestingSwapper: cannot execute after initiation");
        _;
    }

    modifier beforeStart(address vestingToken) {
        require(!vestingInfo[vestingToken].isInitiated || block.timestamp < vestingInfo[vestingToken].start, "VestingSwapper: cannot execute after start");
        _;
    }

    // @param token ton token
    constructor (ERC20Mintable token) public {
        _token = token;
    }

    // @param vestingToken the address of vesting token
    function swap(VestingToken vestingToken) external returns (bool) {
        uint256 ratio = vestingInfo[address(vestingToken)].ratio;
        require(ratio > 0, "VestingSwapper: not valid sale token address");

        uint256 unreleased = releasableAmount(address(vestingToken), msg.sender);
        if (unreleased == 0) {
            return true;
        }
        uint256 ton_amount = unreleased.mul(ratio);
        bool success = vestingToken.destroyTokens(address(this), unreleased);
        require(success);
        //success = _token.transfer(msg.sender, ton_amount);
        success = _token.transferFrom(address(vault), address(this), ton_amount);
        require(success);
        success = _token.transfer(msg.sender, ton_amount);
        require(success);
        increaseReleasedAmount(address(vestingToken), msg.sender, unreleased);
        
        emit Swapped(msg.sender, unreleased, ton_amount);
        return true;
    }

    function changeController(VestingToken vestingToken, address payable newController) external onlyPrimary {
        vestingToken.changeController(newController);
    }

    function setVault(TONVault vaultAddress) external onlyPrimary {
        vault = vaultAddress;
    }

    function withdraw(address payable recipient, uint amount256) external onlyPrimary {
        _token.transfer(recipient, amount256);
        emit Withdrew(recipient, amount256);
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

    //
    // init
    //

    /*function registerBeneficiary(address vestingToken, address[] memory beneficiaries, uint256[] memory amounts) public onlyPrimary {
        require(beneficiaries.length == amounts.length);
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            BeneficiaryInfo storage info = beneficiaryInfo[vestingToken][beneficiaries[i]];
            info.totalAmount = amounts[i];
        }
    }*/

    function receiveApproval(address from, uint256 _amount, address payable _token, bytes memory _data) public {
        VestingToken token = VestingToken(_token);
        require(_amount <= token.balanceOf(from), "VestingSwapper: receiveApproval error 1");

        bool success = token.transferFrom(from, address(this), _amount);
        require(success, "VestingSwapper: receiveApproval error 2");

        add(token, from, _amount);
    }

    function add(VestingToken vestingToken, address beneficiary, uint256 amount) internal {
        BeneficiaryInfo storage info = beneficiaryInfo[address(vestingToken)][beneficiary];
        info.totalAmount = info.totalAmount.add(amount);
    }

    //
    // init vesting info
    //

    // @notice initiate VestingToken
    // @param vestingToken the address of vesting token
    // @param start start timestamp
    // @param cliffDurationInSeconds cliff duration from start date in seconds
    // @param firstClaimDurationInSeconds the first claim duration from start date in seconds
    // @param firstClaimAmount the first claim amount of the VestingToken
    // @param durationUnit duration unit 
    function initiate(address vestingToken, uint256 start, uint256 cliffDurationInSeconds, uint256 firstClaimDurationInSeconds, uint256 firstClaimAmount, uint256 durationUnit) public onlyPrimary beforeInitiated(vestingToken) {
        require(cliffDurationInSeconds <= durationUnit.mul(UNIT_IN_SECONDS), "VestingSwapper: cliff is longer than duration");
        require(durationUnit > 0, "VestingSwapper: duration is 0");
        require(start.add(durationUnit.mul(UNIT_IN_SECONDS)) > block.timestamp, "VestingSwapper: final time is before current time");
        // TODO: firstClaimAmount should be less than token total supply

        VestingInfo storage info = vestingInfo[vestingToken];
        info.start = start;
        info.cliff = start.add(cliffDurationInSeconds);
        info.firstClaimTimestamp = start.add(firstClaimDurationInSeconds);
        info.firstClaimAmount = firstClaimAmount;
        info.durationUnit = durationUnit;
        info.durationInSeconds = durationUnit.mul(UNIT_IN_SECONDS);
        info.isInitiated = true;
        info.initialTotalSupply = IERC20(vestingToken).totalSupply();
    }

    function updateRatio(address vestingToken, uint256 tokenRatio) external onlyPrimary beforeStart(vestingToken) {
        VestingInfo storage info = vestingInfo[vestingToken];
        info.ratio = tokenRatio;
    }

    // @notice get swapping ratio of VestingToken
    // @param vestingToken the address of vesting token
    // @param beneficiary the address of beneficiary
    // @return the swapping ratio of the token
    function ratio(address vestingToken) public view returns (uint256) {
        VestingInfo storage info = vestingInfo[vestingToken];
        return info.ratio;
    }

    //
    // get vesting info
    //

    function initiated(address vestingToken) public view returns (bool) {
        VestingInfo storage info = vestingInfo[vestingToken];
        return info.isInitiated;
    }

    // @notice get vesting start date
    // @param vestingToken the address of vesting token
    // @return timestamp of the start date
    function start(address vestingToken) public view returns (uint256) {
        VestingInfo storage info = vestingInfo[vestingToken];
        return info.start;
    }

    // @notice get vesting cliff date
    // @param vestingToken the address of vesting token
    // @return timestamp of the cliff date
    function cliff(address vestingToken) public view returns (uint256) {
        VestingInfo storage info = vestingInfo[vestingToken];
        return info.cliff;
    }

    function firstClaim(address vestingToken) public view returns (uint256) {
        VestingInfo storage info = vestingInfo[vestingToken];
        return info.firstClaimTimestamp;
    }

    // @notice get the number of duration unit
    // @param vestingToken the address of vesting token
    // @return the number of duration unit
    function duration(address vestingToken) public view returns (uint256) {
        VestingInfo storage info = vestingInfo[vestingToken];
        return info.durationUnit;
    }

    //
    // beneficiary info
    //

    // @notice get total deposit amount of VestingToken
    // @param vestingToken the address of vesting token
    // @param beneficiary the address of beneficiary
    // @return the amount of the token deposited
    function totalAmount(address vestingToken, address beneficiary) public view returns (uint256) {
        return beneficiaryInfo[vestingToken][beneficiary].totalAmount;
    }

    // @notice get released(swapped) amount of VestingToken
    // @param vestingToken the address of vesting token
    // @param beneficiary the address of beneficiary
    // @return the amount of the token released
    function released(address vestingToken, address beneficiary) public view returns (uint256) {
        return beneficiaryInfo[vestingToken][beneficiary].releasedAmount;
    }

    // @notice get releasable amount of VestingToken
    // @param vestingToken the address of vesting token
    // @param beneficiary the address of beneficiary
    // @return the releasable amount of the token
    function releasableAmount(address vestingToken, address beneficiary) public view returns (uint256) {
        uint256 releasedAmount = released(vestingToken, beneficiary);
        return _releasableAmountLimit(vestingToken, beneficiary).sub(releasedAmount);
    }

    function increaseReleasedAmount(address vestingToken, address beneficiary, uint256 amount) internal {
        BeneficiaryInfo storage info = beneficiaryInfo[vestingToken][beneficiary];
        info.releasedAmount = info.releasedAmount.add(amount);
    }

    function _releasableAmountLimit(address vestingToken, address beneficiary) internal view returns (uint256) {
        VestingInfo storage vestingInfo = vestingInfo[vestingToken];

        if (!vestingInfo.isInitiated) {
            return 0;
        }

        if (block.timestamp < vestingInfo.cliff) {
            return 0;
        } else if (block.timestamp < vestingInfo.firstClaimTimestamp) {
            return firstClaimAmount(vestingToken, beneficiary);
        } else if (block.timestamp >= vestingInfo.firstClaimTimestamp.add(vestingInfo.durationInSeconds)) {
            return totalAmount(vestingToken, beneficiary);
        } else {
            uint256 userFirstClaimAmount = firstClaimAmount(vestingToken, beneficiary);
            uint256 currenUnit = block.timestamp.sub(vestingInfo.firstClaimTimestamp).div(UNIT_IN_SECONDS).add(1);
            uint256 totalAmount = totalAmount(vestingToken, beneficiary);
            return totalAmount.sub(userFirstClaimAmount).mul(currenUnit).div(vestingInfo.durationUnit).add(userFirstClaimAmount);
        }
    }
    
    function firstClaimAmount(address vestingToken, address beneficiary) internal view returns (uint256) {
        VestingInfo storage vestingInfo = vestingInfo[vestingToken];

        uint256 userTotalAmount = totalAmount(vestingToken, beneficiary);
        uint256 tokenTotalAmount = vestingInfo.initialTotalSupply;
        return vestingInfo.firstClaimAmount.mul(userTotalAmount).div(tokenTotalAmount);
    }
}
