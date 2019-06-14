const { balance, BN, ether, constants, expectRevert, time } = require('openzeppelin-test-helpers');

const Presale = artifacts.require('Presale');
const MiniMeToken = artifacts.require('MiniMeToken');
const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory');
const ERC20Mintable = artifacts.require('ERC20Mintable');
const Swapper = artifacts.require('Swapper');

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

  const decimals = new BN('18');
  const presaleAmount = new BN('10').pow(decimals).mul(new BN('65000'));
  const devAmount = new BN('10').pow(decimals).mul(new BN('10000'));
  const partnershipAmount = new BN('10').pow(decimals).mul(new BN('10000'));
  const initialAmount = new BN('10').pow(decimals); // number of tokens sold at public sale
  const swapRate = initialAmount.div(new BN('100'));

  context('once deployed', async function () {
    beforeEach(async function () {
      this.tokenFactory = await MiniMeTokenFactory.new({ from: controller });
      this.pton = await MiniMeToken.new(
        this.tokenFactory.address,
        constants.ZERO_ADDRESS,
        0,
        'MiniMe Test Token',
        18,
        'MMT',
        true,
        { from: controller }
      );

      await time.advanceBlock();
      const startingTime = await time.latest();
      const closingTime = startingTime.add(time.duration.years(1));

      this.presale = await Presale.new(
        rate,
        wallet,
        this.pton.address,
        tokenWallet,
        cap,
        individualMinCap,
        individualMaxCap,
        startingTime,
        closingTime,
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
        await this.pton.generateTokens(tokenWallet, presaleAmount, { from: controller });
        await this.pton.generateTokens(dev, devAmount, { from: controller });
        await this.pton.generateTokens(partnership, partnershipAmount, { from: controller });
        await this.pton.approve(this.presale.address, presaleAmount, { from: tokenWallet });
        await this.pton.changeController(constants.ZERO_ADDRESS, { from: controller });

        // buyers[0], buyers[1]: whitelist member
        // buyers[2]           : whitelist non-member
        await this.presale.addWhitelisted(buyers[0], { from: admin });
        await this.presale.addWhitelisted(buyers[1], { from: admin });
      });

      describe('on sale', function () {
        it('should accept payments within individual cap', async function () {
          await this.presale.buyTokens(buyers[0], { value: purchaseAmount });
          (await this.pton.balanceOf(buyers[0])).should.be.bignumber.equal(purchaseAmount.mul(rate));
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

      context('finish sale', function () {
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

        context('after sale', function () {
          beforeEach(async function () {
            await this.presale.finalize({ from: admin });

          context('swap token', function () {
            beforeEach(async function () {
              this.ton = await ERC20Mintable.new({ from: admin });
              this.swapper = await Swapper.new(initialAmount);
              await this.ton.addMinter(this.swapper.address, { from: admin });
            });

            it('should accept swap from PTON to TON', async function () {
              const ptonAmount = await this.pton.balanceOf(buyers[0]);
              await this.pton.approve(this.swapper.address, ptonAmount, { from: buyers[0] });
              await this.swapper.swap(this.pton.address, this.ton.address, { from: buyers[0] });
              (await this.ton.balanceOf(buyers[0])).should.be.bignumber.equals(ptonAmount.mul(swapRate));
            });
          });
        });
      });
    });
  });
});
