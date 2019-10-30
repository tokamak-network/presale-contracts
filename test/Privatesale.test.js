const { BN, balance, constants, ether, expectEvent, expectRevert, send } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const VestingToken = artifacts.require('VestingToken');
const Privatesale = artifacts.require('Privatesale');

const chai = require('chai');

chai.should();

const { toBN } = web3.utils;

const payments = [
  // 1st payment
  {
    numerator: toBN('664893617021277'),
    denominator: toBN('10000000000000000'),
    cap: ether('2127.65957446809'),
    tokenAmount: ether('32000'),
  },
];

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

  describe('permissions', function () {
    const i = 0;

    const purchaser = purchasers[i];
    const numerator = numerators[i];
    const denominator = denominators[i];
    const cap = caps[i];

    it('only owner can call setCapAndPrice', async function () {
      await expectRevert.unspecified(
        this.sale.setCapAndPrice(purchaser, cap, numerator, denominator, { from: purchaser }),
        'WhitelistedRole: caller does not have the Whitelisted role'
      );
      await this.sale.setCapAndPrice(purchaser, cap, numerator, denominator, { from: owner });
    });

    it('only owner can call setCap', async function () {
      await expectRevert.unspecified(
        this.sale.setCap(purchaser, cap, { from: purchaser }),
        'CapperRole: caller does not have the Capper role',
      );
      await this.sale.setCap(purchaser, cap, { from: owner });
    });

    it('only owner can call addWhitelisted', async function () {
      await expectRevert.unspecified(
        this.sale.addWhitelisted(purchaser, { from: purchaser }),
        'WhitelistedRole: caller does not have the Whitelisted role'
      );
      await this.sale.addWhitelisted(purchaser, { from: owner });
    });

    it('only owner can call setPrice', async function () {
      await expectRevert.unspecified(
        this.sale.setPrice(purchaser, numerator, denominator, { from: purchaser }),
        'CapperRole: caller does not have the Capper role',
      );
      await this.sale.setPrice(purchaser, numerator, denominator, { from: owner });
    });
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
      const numerator = web3.utils.toBN(Math.floor(Math.random() * 1000) || 1);
      const denominator = web3.utils.toBN(Math.floor(Math.random() * 100) || 1);
      const cap = web3.utils.toBN(Math.floor(Math.random() * 1000) || 1);

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

  it.only('should accept payments', async function () {
    purchasers.length.should.be.gt(payments.length, `use more than ${payments.length} accounts in testrpc`);

    const totalSupply = await this.token.totalSupply();

    let investedTokenAmount = new BN('0');

    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i];

      const numerator = toBN(payment.numerator);
      const denominator = toBN(payment.denominator);
      const cap = toBN(payment.cap);
      const tokenAmount = toBN(payment.tokenAmount);

      const ethAmount1 = smallPayment;
      const ethAmount2 = cap.sub(ethAmount1);

      const tokenAmount1 = ethAmount1.mul(numerator).div(denominator);
      const tokenAmount2 = ethAmount2.mul(numerator).div(denominator);

      console.log(`
      ethAmount1          :  ${ethAmount1.toString(10)}
      ethAmount2          :  ${ethAmount2.toString(10)}
      ethAmount1+2        :  ${ethAmount1.add(ethAmount2).toString(10)}
      cap                 :  ${cap.toString(10)}

      tokenAmount1          :  ${tokenAmount1.toString(10)}
      tokenAmount2          :  ${tokenAmount2.toString(10)}
      tokenAmount1+2        :  ${tokenAmount1.add(tokenAmount2).toString(10)}
      expected tokenAmount  :  ${tokenAmount.toString(10)}

      ethAmount1      : ${ethAmount1.toString()}
      numerator       : ${numerator.toString()}
      denominator     : ${denominator.toString()}

      ethAmount1.mul(numerator)                   : ${ethAmount1.mul(numerator).toString()}
      ethAmount1.mul(numerator).div(denominator)  : ${ethAmount1.mul(numerator).div(denominator).toString()}

      ethAmount2.mul(numerator)                   : ${ethAmount2.mul(numerator).toString()}
      ethAmount2.mul(numerator).div(denominator)  : ${ethAmount2.mul(numerator).div(denominator).toString()}

      cap.mul(numerator)                          : ${cap.mul(numerator).toString()}
      cap.mul(numerator).div(denominator)         : ${cap.mul(numerator).div(denominator).toString()}
      `);

      // tokenAmount.should.be.bignumber.equal(
      //   tokenAmount1.add(tokenAmount2),
      //   'token amount mismatched. please check numerator, denominator, and cap',
      // );

      investedTokenAmount = investedTokenAmount.add(tokenAmount);

      totalSupply.should.be.bignumber.gte(
        investedTokenAmount,
        `${i}th purchaser cannot buy tokens more than total supply`,
      );

      const purchaser = purchasers[i];

      await this.sale.setCapAndPrice(purchaser, cap, numerator, denominator);

      const { logs: logs1 } = await this.sale.buyTokens(purchaser, { from: purchaser, value: ethAmount1 });

      expectEvent.inLogs(logs1, 'TokensPurchased', {
        purchaser: purchaser,
        beneficiary: purchaser,
        value: ethAmount1,
        amount: tokenAmount1,
      });

      const { logs: logs2 } = await this.sale.buyTokens(purchaser, { from: purchaser, value: ethAmount2 });

      expectEvent.inLogs(logs2, 'TokensPurchased', {
        purchaser: purchaser,
        beneficiary: purchaser,
        value: ethAmount2,
        amount: tokenAmount2,
      });

      const purchaserBalance = await this.token.balanceOf(purchaser);
      purchaserBalance.should.be.bignumber.equal(tokenAmount);
    }
  });
});
