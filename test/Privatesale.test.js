const { BN, balance, constants, ether, expectEvent, expectRevert, send } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const VestingToken = artifacts.require('VestingToken');
const Privatesale = artifacts.require('Privatesale');

require('chai')
  .should();

contract('Privatesale', function ([owner, wallet, ...purchasers]) {
  const numerators = [new BN('104'), new BN('153')];
  const denominators = [new BN('2'), new BN('3')];
  const caps = [ether('300'), ether('600')];

  const totalSupply = ether('224000');

  let smallPayment;

  beforeEach(async function () {
    this.token = await VestingToken.new(
      ZERO_ADDRESS, ZERO_ADDRESS, 0, 'PTON test token', 18, 'PTON-test', true, { from: owner }
    );

    this.sale = await Privatesale.new(
      wallet, this.token.address, { from: owner }
    );

    smallPayment = await this.sale.smallPayment();

    await this.token.generateTokens(this.sale.address, totalSupply, { from: owner });
  });

  describe('payment validation', function () {
    it('cannot buy tokens before whitelisted', async function () {
      const i = 0;

      const purchaser = purchasers[i];
      const numerator = numerators[i];
      const denominator = denominators[i];
      const cap = caps[i];
      const amount = cap;

      await this.sale.setCap(purchaser, cap);
      await this.sale.setPrice(purchaser, numerator, denominator);

      await expectRevert.unspecified(this.sale.buyTokens(purchaser, { from: purchaser, value: amount }));
    });

    it('cannot buy tokens before cap set', async function () {
      const i = 0;

      const purchaser = purchasers[i];
      const numerator = numerators[i];
      const denominator = denominators[i];
      const cap = caps[i];
      const amount = cap;

      await this.sale.addWhitelisted(purchaser);
      await this.sale.setPrice(purchaser, numerator, denominator);

      await expectRevert.unspecified(this.sale.buyTokens(purchaser, { from: purchaser, value: amount }));
    });

    it('cannot buy tokens before price set', async function () {
      const i = 0;

      const purchaser = purchasers[i];
      const cap = caps[i];
      const amount = cap;

      await this.sale.addWhitelisted(purchaser);
      await this.sale.setCap(purchaser, cap);

      await expectRevert(
        this.sale.buyTokens(purchaser, { from: purchaser, value: amount }),
        'IndividuallyPricedCrowdsale: the price of purchaser must be set',
      );
    });

    it('can buy tokens with the exact amount of cap', async function () {
      const i = 0;

      const purchaser = purchasers[i];
      const numerator = numerators[i];
      const denominator = denominators[i];
      const cap = caps[i];
      const amount = cap;
      const tokenAmount = amount.mul(numerator).div(denominator);

      await this.sale.setCapAndPrice(purchaser, cap, numerator, denominator);

      const { logs } = await this.sale.buyTokens(purchaser, { from: purchaser, value: amount });

      expectEvent.inLogs(logs, 'TokensPurchased', {
        purchaser: purchaser,
        beneficiary: purchaser,
        value: amount,
        amount: tokenAmount,
      });
    });

    it('cannot buy tokens with amount more than individual cap', async function () {
      const i = 0;

      const purchaser = purchasers[i];
      const numerator = numerators[i];
      const denominator = denominators[i];
      const cap = caps[i];
      const amount = cap.add(new BN('1'));

      await this.sale.setCapAndPrice(purchaser, cap, numerator, denominator);

      await expectRevert(
        this.sale.buyTokens(purchaser, { from: purchaser, value: amount }),
        'IndividuallyCappedCrowdsale: beneficiary\'s cap exceeded',
      );
    });

    it('cannot buy tokens with amount less than individual cap', async function () {
      const i = 0;

      const purchaser = purchasers[i];
      const numerator = numerators[i];
      const denominator = denominators[i];
      const cap = caps[i];
      const amount = cap.sub(new BN('1'));

      await this.sale.setCapAndPrice(purchaser, cap, numerator, denominator);

      await expectRevert(
        this.sale.buyTokens(purchaser, { from: purchaser, value: amount }),
        'Privatesale: wei amount should be equal to purchaser cap or equal to 0.03 ether',
      );
    });

    it('can buy tokens with 0.03 ether and the rest of the cap', async function () {
      const i = 0;

      const purchaser = purchasers[i];
      const numerator = numerators[i];
      const denominator = denominators[i];
      const cap = caps[i];
      const ethAmount1 = smallPayment;
      const ethAmount2 = cap.sub(smallPayment);
      const tokenAmount1 = ethAmount1.mul(numerator).div(denominator);
      const tokenAmount2 = ethAmount2.mul(numerator).div(denominator);

      const walletBalance = await balance.tracker(wallet);

      await this.sale.setCapAndPrice(purchaser, cap, numerator, denominator);

      const { logs: logs1 } = await this.sale.buyTokens(purchaser, { from: purchaser, value: ethAmount1 });

      expectEvent.inLogs(logs1, 'TokensPurchased', {
        purchaser: purchaser,
        beneficiary: purchaser,
        value: ethAmount1,
        amount: tokenAmount1,
      });

      (await walletBalance.delta()).should.be.bignumber.equal(ethAmount1);

      const { logs: logs2 } = await this.sale.buyTokens(purchaser, { from: purchaser, value: ethAmount2 });

      expectEvent.inLogs(logs2, 'TokensPurchased', {
        purchaser: purchaser,
        beneficiary: purchaser,
        value: ethAmount2,
        amount: tokenAmount2,
      });

      (await walletBalance.delta()).should.be.bignumber.equal(ethAmount2);
    });
  });

  describe('price precision', function () {
    for (let i = 0; i < caps.length; i++) {
      it(`token amount must be well calculated with (numerator=${numerators[i]}, denominator=${denominators[i]})`, async function () {
        const purchaser = purchasers[i];
        const numerator = numerators[i];
        const denominator = denominators[i];
        const cap = caps[i];
        const ethAmount = cap;
        const tokenAmount = ethAmount.mul(numerator).div(denominator);

        await this.sale.setCapAndPrice(purchaser, cap, numerator, denominator);

        const { logs } = await this.sale.buyTokens(purchaser, { from: purchaser, value: ethAmount });

        expectEvent.inLogs(logs, 'TokensPurchased', {
          purchaser: purchaser,
          beneficiary: purchaser,
          value: ethAmount,
          amount: tokenAmount,
        });

        const tokens = await this.token.balanceOf(purchaser);
        tokens.should.be.bignumber.equal(tokenAmount);
      });
    }

    for (const purchaser of purchasers) {
      const numerator = web3.utils.toBN(Math.floor(Math.random() * 1000));
      const denominator = web3.utils.toBN(Math.floor(Math.random() * 100));
      const cap = web3.utils.toBN(Math.floor(Math.random() * 1000));

      it(`token amount must be well calculated with (numerator=${numerator}, denominator=${denominator})`, async function () {
        const ethAmount = cap;
        const tokenAmount = ethAmount.mul(numerator).div(denominator);

        await this.sale.setCapAndPrice(purchaser, cap, numerator, denominator);

        const { logs } = await this.sale.buyTokens(purchaser, { from: purchaser, value: ethAmount });

        expectEvent.inLogs(logs, 'TokensPurchased', {
          purchaser: purchaser,
          beneficiary: purchaser,
          value: ethAmount,
          amount: tokenAmount,
        });

        const tokens = await this.token.balanceOf(purchaser);
        tokens.should.be.bignumber.equal(tokenAmount);
      });
    }
  });
});
