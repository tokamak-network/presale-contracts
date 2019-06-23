const { BN, ether, expectEvent, expectRevert, time } = require('openzeppelin-test-helpers');

const ERC20Mintable = artifacts.require('ERC20Mintable');
const TokenVestingCrowdsaleImpl = artifacts.require('TokenVestingCrowdsaleImpl');

require('chai')
  .should();

contract('TokenVestingCrowdsale', function ([_, owner, wallet, investor]) {
  const rate = new BN('2');
  const value = ether('10');
  const expectedTokenAmount = rate.mul(value);
  const saleAmount = new BN('10').pow(new BN('22'));

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

      const { logs } = await this.crowdsale.sendTransaction({ value: value, from: investor });
      expectEvent.inLogs(logs, 'TokensPurchased', {
        purchaser: investor,
        beneficiary: investor,
        value: value,
        amount: expectedTokenAmount,
      });
      (await this.token.balanceOf(this.crowdsale.address)).should.be.bignumber
        .equal(saleAmount.sub(expectedTokenAmount));
    });

    it('reverts when all token have not yet sold', async function () {
      await this.token.mint(this.crowdsale.address, saleAmount, { from: owner });

      this.start = (await time.latest()).add(time.duration.minutes(1));
      this.cliffDuration = time.duration.years(1);
      this.duration = time.duration.years(2);
      await expectRevert(
        this.crowdsale._initiate(this.start, this.cliffDuration, this.duration),
        'TokenVestingCrowdsale: all tokens have not been sold yet'
      );
    });

    it('reverts when initiation already happened', async function () {
      this.start = (await time.latest()).add(time.duration.minutes(1));
      this.cliffDuration = time.duration.years(1);
      this.duration = time.duration.years(2);
      await this.crowdsale._initiate(this.start, this.cliffDuration, this.duration);
      await expectRevert(
        this.crowdsale._initiate(this.start, this.cliffDuration, this.duration),
        'TokenVestingCrowdsale: already initiated'
      );
    });
  });
});
