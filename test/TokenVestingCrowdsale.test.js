const { BN, ether, expectEvent, expectRevert, time } = require('openzeppelin-test-helpers');

const ERC20Mintable = artifacts.require('ERC20Mintable');
const TokenVestingCrowdsaleImpl = artifacts.require('TokenVestingCrowdsaleImpl');

require('chai')
  .should();

contract('TokenVestingCrowdsale', function ([_, owner, wallet, beneficiary]) {
  const rate = new BN('2');
  const value = ether('1');
  const amount = rate.mul(value);
  const saleAmount = new BN('10').pow(new BN('20'));

  beforeEach(async function () {
    this.start = (await time.latest()).add(time.duration.minutes(1));
    this.cliffDuration = time.duration.years(1);
    this.duration = time.duration.years(2);
  });

  context('once deployed', function () {
    beforeEach(async function () {
      this.token = await ERC20Mintable.new({ from: owner });
      this.crowdsale = await TokenVestingCrowdsaleImpl.new(rate, wallet, this.token.address, { from: owner });
    });

    it('should not be initiated', async function () {
      (await this.crowdsale.initiated()).should.be.equal(false);
    });

    it('can buy tokens', async function () {
      await this.token.mint(this.crowdsale.address, saleAmount, { from: owner });

      const { logs } = await this.crowdsale.sendTransaction({ value: value, from: beneficiary });
      expectEvent.inLogs(logs, 'TokensPurchased', {
        purchaser: beneficiary,
        beneficiary: beneficiary,
        value: value,
        amount: amount,
      });
      (await this.token.balanceOf(this.crowdsale.address)).should.be.bignumber
        .equal(saleAmount.sub(amount));
    });

    it('reverts when all token have not yet sold', async function () {
      await this.token.mint(this.crowdsale.address, saleAmount, { from: owner });
      await expectRevert(
        this.crowdsale.initiate(this.start, this.cliffDuration, this.duration),
        'TokenVestingCrowdsale: all tokens have not been sold yet'
      );
    });

    it('reverts when initiation already happened', async function () {
      await this.crowdsale.initiate(this.start, this.cliffDuration, this.duration);
      await expectRevert(
        this.crowdsale.initiate(this.start, this.cliffDuration, this.duration),
        'TokenVestingCrowdsale: already initiated'
      );
    });

    it('can not be released before initiation', async function () {
      await expectRevert(
        this.crowdsale.release(beneficiary, { from: beneficiary }),
        'TokenVestingCrowdsale: not yet initiated'
      );
    });

    context('after initiated', function () {
      beforeEach(async function () {
        await this.token.mint(this.crowdsale.address, saleAmount, { from: owner });

        await this.crowdsale.sendTransaction({ value: value, from: beneficiary });

        const remainingAmount = await this.token.balanceOf(this.crowdsale.address);
        await this.crowdsale.sendTransaction({ value: remainingAmount.div(rate) });

        await this.crowdsale.initiate(this.start, this.cliffDuration, this.duration);
      });

      it('cannot be released before cliff', async function () {
        await expectRevert(this.crowdsale.release(beneficiary),
          'TokenVesting: no tokens are due'
        );
      });

      it('should release proper amount after cliff', async function () {
        await time.increaseTo(this.start.add(this.cliffDuration));

        await this.crowdsale.release(beneficiary);
        const releaseTime = await time.latest();

        const releasedAmount = amount.mul(releaseTime.sub(this.start)).div(this.duration);
        (await this.token.balanceOf(beneficiary)).should.bignumber.equal(releasedAmount);
      });

      it('should have released all after end', async function () {
        await time.increaseTo(this.start.add(this.duration));
        await this.crowdsale.release(beneficiary);
        (await this.token.balanceOf(beneficiary)).should.bignumber.equal(amount);
      });
    });
  });
});
