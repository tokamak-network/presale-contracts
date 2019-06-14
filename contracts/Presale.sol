pragma solidity ^0.5.0;

import "./openzeppelin-solidity/token/ERC20/IERC20.sol";
import "./openzeppelin-solidity/payment/escrow/RefundEscrow.sol";
import "./openzeppelin-solidity/crowdsale/validation/CappedCrowdsale.sol";
import "./openzeppelin-solidity/crowdsale/emission/AllowanceCrowdsale.sol";
import "./openzeppelin-solidity/crowdsale/validation/WhitelistCrowdsale.sol";
import "./openzeppelin-solidity/crowdsale/distribution/FinalizableCrowdsale.sol";


contract Presale is CappedCrowdsale, AllowanceCrowdsale, WhitelistCrowdsale, FinalizableCrowdsale {
    using SafeMath for uint256;

    // refund escrow used to hold funds while crowdsale is running
    RefundEscrow private escrow;

    mapping(address => uint256) private contributions;
    uint256 private individualMinCap;
    uint256 private individualMaxCap;

    constructor (
        uint256 _rate,
        address payable _wallet,
        IERC20 _token,
        address tokenWallet,
        uint256 _cap,
        uint256 _individualMinCap,
        uint256 _individualMaxCap,
        uint256 _openingTime,
        uint256 _closingTime
    )
        public
        Crowdsale(_rate, _wallet, _token)
        CappedCrowdsale(_cap)
        AllowanceCrowdsale(tokenWallet)
        TimedCrowdsale(_openingTime, _closingTime)
    {
        escrow = new RefundEscrow(_wallet);

        individualMinCap = _individualMinCap;
        individualMaxCap = _individualMaxCap;
    }

    function setIndividualMinCap(uint256 newIndividualMinCap) external onlyWhitelistAdmin {
        individualMinCap = newIndividualMinCap;
    }

    function setIndividualMaxCap(uint256 newIndividualMaxCap) external onlyWhitelistAdmin {
        individualMaxCap = newIndividualMaxCap;
    }

    function getIndividualMinCap() public view returns (uint256) {
        return individualMinCap;
    }

    function getIndividualMaxCap() public view returns (uint256) {
        return individualMaxCap;
    }

    function finalize() public onlyWhitelistAdmin {
        super.finalize();

        escrow.close();
        escrow.beneficiaryWithdraw();
    }

    function refund() public onlyWhitelistAdmin {
        escrow.enableRefunds();
    }

    function claimRefund(address payable refundee) public {
        escrow.withdraw(refundee);
    }

    function hasClosed() public view returns (bool) {
        return !super.finalized();
    }

    function addWhitelistedList(address[] memory accounts) public onlyWhitelistAdmin {
        for(uint256 i = 0; i < accounts.length; i++) {
            require(accounts[i] != address(0), "Presale: account is the zero address");
            _addWhitelisted(accounts[i]);
        }
    }

    /**
     * @dev low level token purchase ***DO NOT OVERRIDE***
     * This function has a non-reentrancy guard, so it shouldn't be called by
     * another `nonReentrant` function.
     * @param beneficiary Recipient of the token purchase
     */
    function buyTokens(address beneficiary) public nonReentrant payable {
        uint256 weiAmount = msg.value;
        _preValidatePurchase(beneficiary, weiAmount);

        // adjust weiAmount with respect to cap and individual cap.
        weiAmount = _updatePurchaseAmount(beneficiary, weiAmount);

        // calculate token amount to be created
        uint256 tokens = _getTokenAmount(weiAmount);

        // update state
        _weiRaised = _weiRaised.add(weiAmount);

        _processPurchase(beneficiary, tokens);
        emit TokensPurchased(msg.sender, beneficiary, weiAmount, tokens);

        _updatePurchasingState(beneficiary, weiAmount);

        _forwardFunds();
        _postValidatePurchase(beneficiary, weiAmount);
    }

    function _updatePurchaseAmount(address beneficiary, uint weiAmount) internal returns (uint) {
        uint amount = weiAmount;
        uint maxCap = cap();

        // check max cap
        uint amountWithWeiRaised = weiRaised().add(amount);

        if (amountWithWeiRaised > maxCap) {
            amount = amount.sub(amountWithWeiRaised.sub(maxCap));
        }

        // check individual max cap
        uint amountWithContribution = contributions[beneficiary].add(amount);

        if (amountWithContribution > individualMaxCap) {
            amount = amount.sub(amountWithContribution.sub(individualMaxCap));
        }

        uint refundAmount = weiAmount.sub(amount);
        if (refundAmount > 0) {
            // buyTokens is safe for reenterancy attack, so we can transfer transfer here.
            msg.sender.transfer(refundAmount);
        }

        return amount;
    }


    /**
     * @dev Extend parent behavior requiring purchase to respect the beneficiary's funding cap.
     * @param beneficiary Token purchaser
     * @param weiAmount Amount of wei contributed
     */
    function _preValidatePurchase(address beneficiary, uint256 weiAmount) internal view {
        super._preValidatePurchase(beneficiary, weiAmount);

        uint256 individualWeiAmount = contributions[beneficiary].add(weiAmount);
        require(individualWeiAmount >= individualMinCap, "Presale: less than min cap");
        require(individualWeiAmount <= individualMaxCap, "Presale: more than max cap");
    }

    /**
     * @dev Extend parent behavior to update beneficiary contributions.
     * @param beneficiary Token purchaser
     * @param weiAmount Amount of wei contributed
     */
    function _updatePurchasingState(address beneficiary, uint256 weiAmount) internal {
        super._updatePurchasingState(beneficiary, weiAmount);
        contributions[beneficiary] = contributions[beneficiary].add(weiAmount);
    }

    /**
     * @dev Overrides Crowdsale fund forwarding, sending funds to escrow.
     */
    function _forwardFunds() internal {
        escrow.deposit.value(msg.value)(msg.sender);
    }
}
