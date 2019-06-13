const { balance, BN, ether, constants, expectRevert } = require('openzeppelin-test-helpers');

const Presale = artifacts.require('Presale');
const MiniMeToken = artifacts.require('MiniMeToken');
const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory');

require('chai')
  .should();

contract('Presale', function ([_, controller, admin, wallet, tokenWallet, dev, partnership, ...buyers]) {
  const rate = new BN('2');
  const cap = ether('30');
  const lessThanMinCap = ether('5');
  const individualMinCap = ether('10');
  const purchaseAmount = ether('15');
  const individualMaxCap = ether('20');
  const moreThanMaxCap = ether('25');

  const presaleAmount = new BN('10').pow(new BN('18')).mul(new BN('65000'));
  const devAmount = new BN('10').pow(new BN('18')).mul(new BN('10000'));
  const partnershipAmount = new BN('10').pow(new BN('18')).mul(new BN('10000'));

  context('once deployed', async function () {
    beforeEach(async function () {
      this.tokenFactory = await MiniMeTokenFactory.new({ from: controller });
      this.token = await MiniMeToken.new(
        this.tokenFactory.address,
        constants.ZERO_ADDRESS,
        0,
        'MiniMe Test Token',
        18,
        'MMT',
        true,
        { from: controller }
      );
      this.presale = await Presale.new(
        rate,
        wallet,
        this.token.address,
        tokenWallet,
        cap,
        individualMinCap, 
        individualMaxCap,
        { from: admin }
      );
    });

    describe('before sale', function () {
      it('sets a cap when the sender is a admin', async function () {
        await this.presale.setIndividualMinCap(individualMinCap, { from: admin });
        (await this.presale.getIndividualMinCap()).should.be.bignumber.equal(individualMinCap);

        await this.presale.setIndividualMaxCap(individualMaxCap, { from: admin });
        (await this.presale.getIndividualMaxCap()).should.be.bignumber.equal(individualMaxCap);
      });

      it('reverts when a non-admin sets individual cap', async function () {
        await expectRevert(this.presale.setIndividualMinCap(individualMinCap, { from: buyers[0] }),
          'WhitelistAdminRole: caller does not have the WhitelistAdmin role'
        );
        await expectRevert(this.presale.setIndividualMaxCap(individualMaxCap, { from: buyers[0] }),
          'WhitelistAdminRole: caller does not have the WhitelistAdmin role'
        );
      });
    });

    context('start sale', function () {
      beforeEach(async function () {
        await this.token.generateTokens(tokenWallet, presaleAmount, { from: controller });
        await this.token.generateTokens(dev, devAmount, { from: controller });
        await this.token.generateTokens(partnership, partnershipAmount, { from: controller });
        await this.token.approve(this.presale.address, presaleAmount, { from: tokenWallet });     
        await this.token.changeController(constants.ZERO_ADDRESS, { from: controller });

        // buyers[0], buyers[1]: whitelist member
        // buyers[2]           : whitelist non-member
        await this.presale.addWhitelisted(buyers[0], { from: admin });
        await this.presale.addWhitelisted(buyers[1], { from: admin });
      });

      describe('on sale', function () {
        it('should accept payments within individual cap', async function () {
          await this.presale.buyTokens(buyers[0], { value: purchaseAmount });
          (await this.token.balanceOf(buyers[0])).should.be.bignumber.equal(purchaseAmount.mul(rate));
        });

        it('should reject payments that exceed cap', async function () {
          await this.presale.buyTokens(buyers[0], { value: individualMaxCap });
          await expectRevert(this.presale.buyTokens(buyers[1], { value: individualMaxCap }),
            'CappedCrowdsale: cap exceeded'
          );
        });

        it('should reject payments outside individual min cap', async function () {
          await expectRevert(this.presale.buyTokens(buyers[0], { value: lessThanMinCap }),
            'Presale: Less than min cap'
          );
        });

        it('should reject payments outside individual max cap', async function () {
          await this.presale.buyTokens(buyers[0], { value: individualMaxCap });
          await expectRevert(this.presale.buyTokens(buyers[0], { value: 1 }),
            'Presale: More than max cap'
          );
        });

        it('should reject purchase from non-whitelisted beneficiaries', async function () {
          await expectRevert(this.presale.buyTokens(buyers[2], { value: purchaseAmount }),
            'WhitelistCrowdsale: beneficiary doesn\'t have the Whitelisted role'
          );
        });
      });

      context('after sale', function () {
        beforeEach(async function () {
          await this.presale.buyTokens(buyers[0], { from: buyers[0], value: purchaseAmount });
        });

        it('reverts when a non-admin finalizes sale', async function () {
          await expectRevert(this.presale.finalize({ from: buyers[0] }),
            'WhitelistAdminRole: caller does not have the WhitelistAdmin role'
          );
        });

        it('reverts when a non-admin sets refund to be possible', async function () {
          await expectRevert(this.presale.refund({ from: buyers[0] }),
            'WhitelistAdminRole: caller does not have the WhitelistAdmin role'
          );
        });

        it('should transfer wei to the wallet, if the sale is successful', async function () {
          const walletBalance = await balance.current(wallet);
          await this.presale.finalize({ from: admin });
          (await balance.current(wallet)).sub(walletBalance).should.be.bignumber.equal(purchaseAmount);
        });

        it('should refund wei to refundee, if the sale fails', async function () {
          const refundeeBalance = await balance.current(buyers[0]);
          await this.presale.refund({ from: admin });
          await this.presale.claimRefund(buyers[0]);
          (await balance.current(buyers[0])).sub(purchaseAmount).should.be.bignumber.equal(refundeeBalance);
        });
      });
    }); 
  });
});
