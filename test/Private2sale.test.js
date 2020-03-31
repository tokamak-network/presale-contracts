const { table } = require('table');
const { ETH, PTON2, PTON2_ETH } = require('../payments');

const payments = require('../payments/Private2');

const { BN, balance, constants, ether, expectEvent, expectRevert, send } = require('openzeppelin-test-helpers');

const { ZERO_ADDRESS } = constants;

const VestingToken = artifacts.require('VestingToken');
const Strategicsale = artifacts.require('Strategicsale');

const chai = require('chai');

chai.should();

const { toBN } = web3.utils;

const totalSupply = ether('61000.1');
const e = ether('0.01');

const paymentConfig = {
  columns: {
    0: {
      width: 35,
    },
    1: {
      width: 30,
      alignment: 'right',
    },
    2: {
      width: 30,
      alignment: 'right',
    },
  },
};

const summaryConfig = {
  columns: {
    0: {
      width: 25,
    },
    1: {
      width: 40,
      alignment: 'right',
    },
  },
};

contract('Strategicsale', function ([owner, wallet, ...purchasers]) {
  const rates = [
    PTON2_ETH('10.15'),
    PTON2_ETH('20'),
  ];
  const caps = [
    ETH('300'),
    ETH('600'),
  ];

  let smallPayment;

  beforeEach(async function () {
    this.token = await VestingToken.new(
      ZERO_ADDRESS, ZERO_ADDRESS, 0, 'PTON2 test token', 18, 'PTON2-test', true, { from: owner }
    );

    this.sale = await Strategicsale.new(
      wallet, this.token.address, { from: owner }
    );

    smallPayment = ETH((await this.sale.smallPayment()).toString(10), 'wei');

    await this.token.generateTokens(this.sale.address, totalSupply, { from: owner });
  });

  describe('permissions', function () {
    const i = 0;

    const purchaser = purchasers[i];
    const rate = rates[i];
    const cap = caps[i];

    it('only owner can call setCapAndPrice', async function () {
      await expectRevert.unspecified(
        this.sale.setCapAndPrice(purchaser, cap.toFixed('wei'), rate.toFixed('wei'), { from: purchaser }),
        'WhitelistedRole: caller does not have the Whitelisted role'
      );
      await this.sale.setCapAndPrice(purchaser, cap.toFixed('wei'), rate.toFixed('wei'), { from: owner });

      (await this.sale.getCap(purchaser)).should.be.bignumber.equal(cap.toFixed('wei'));
      (await this.sale.getPrice(purchaser)).should.be.bignumber.equal(rate.toFixed('wei'));
    });

    it('only owner can call setCap', async function () {
      await expectRevert.unspecified(
        this.sale.setCap(purchaser, cap.toFixed('wei'), { from: purchaser }),
        'CapperRole: caller does not have the Capper role',
      );
      await this.sale.setCap(purchaser, cap.toFixed('wei'), { from: owner });
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
        this.sale.setPrice(purchaser, rate.toFixed('wei'), { from: purchaser }),
        'CapperRole: caller does not have the Capper role',
      );
      await this.sale.setPrice(purchaser, rate.toFixed('wei'), { from: owner });
    });
  });

  describe('payment validation', function () {
    it('cannot buy tokens before whitelisted', async function () {
      const i = 0;

      const purchaser = purchasers[i];
      const rate = rates[i];

      const cap = caps[i];
      const amount = cap;

      await this.sale.setCap(purchaser, cap.toFixed('wei'));
      await this.sale.setPrice(purchaser, rate.toFixed('wei'));

      await expectRevert.unspecified(this.sale.buyTokens(purchaser, { from: purchaser, value: amount.toFixed('wei') }));
    });

    it('cannot buy tokens before cap set', async function () {
      const i = 0;

      const purchaser = purchasers[i];
      const rate = rates[i];

      const cap = caps[i];
      const amount = cap;

      await this.sale.addWhitelisted(purchaser);
      await this.sale.setPrice(purchaser, rate.toFixed('wei'));

      await expectRevert.unspecified(this.sale.buyTokens(purchaser, { from: purchaser, value: amount.toFixed('wei') }));
    });

    it('cannot buy tokens before price set', async function () {
      const i = 0;

      const purchaser = purchasers[i];
      const cap = caps[i];
      const amount = cap;

      await this.sale.addWhitelisted(purchaser);
      await this.sale.setCap(purchaser, cap.toFixed('wei'));

      await expectRevert(
        this.sale.buyTokens(purchaser, { from: purchaser, value: amount.toFixed('wei') }),
        'IndividuallyPricedCrowdsale: the price of purchaser must be set',
      );
    });

    it('can buy tokens with the exact amount of cap', async function () {
      const i = 0;

      const purchaser = purchasers[i];
      const rate = rates[i];

      const cap = caps[i];
      const amount = cap;
      const tokenAmount = cap.times(rate);

      await this.sale.setCapAndPrice(purchaser, cap.toFixed('wei'), rate.toFixed('wei'));

      const { logs } = await this.sale.buyTokens(purchaser, { from: purchaser, value: amount.toFixed('wei') });

      expectEvent.inLogs(logs, 'TokensPurchased', {
        purchaser: purchaser,
        beneficiary: purchaser,
        value: amount.toFixed('wei'),
        amount: tokenAmount.toFixed('wei'),
      });
    });

    it('cannot buy tokens with amount more than individual cap', async function () {
      const i = 0;

      const purchaser = purchasers[i];
      const rate = rates[i];

      const cap = caps[i];
      const amount = cap.plus(ETH('1'));

      await this.sale.setCapAndPrice(purchaser, cap.toFixed('wei'), rate.toFixed('wei'));

      await expectRevert(
        this.sale.buyTokens(purchaser, { from: purchaser, value: amount.toFixed('wei') }),
        'IndividuallyCappedCrowdsale: beneficiary\'s cap exceeded',
      );
    });

    it('cannot buy tokens with amount less than individual cap', async function () {
      const i = 0;

      const purchaser = purchasers[i];
      const rate = rates[i];

      const cap = caps[i];
      const amount = cap.minus(ETH('1'));

      await this.sale.setCapAndPrice(purchaser, cap.toFixed('wei'), rate.toFixed('wei'));

      await expectRevert(
        this.sale.buyTokens(purchaser, { from: purchaser, value: amount.toFixed('wei') }),
        'Strategicsale: wei amount should be equal to purchaser cap or equal to 0.03 ether',
      );
    });

    it('can buy tokens with 0.03 ether and the rest of the cap', async function () {
      const i = 0;

      const purchaser = purchasers[i];
      const rate = rates[i];

      const cap = caps[i];
      const ethAmount1 = smallPayment;
      const ethAmount2 = cap.minus(smallPayment);
      const tokenAmount1 = ethAmount1.times(rate);
      const tokenAmount2 = ethAmount2.times(rate);

      const walletBalance = await balance.tracker(wallet);

      await this.sale.setCapAndPrice(purchaser, cap.toFixed('wei'), rate.toFixed('wei'));

      const { logs: logs1 } = await this.sale.buyTokens(purchaser, { from: purchaser, value: ethAmount1.toFixed('wei') });

      expectEvent.inLogs(logs1, 'TokensPurchased', {
        purchaser: purchaser,
        beneficiary: purchaser,
        value: ethAmount1.toFixed('wei'),
        amount: tokenAmount1.toFixed('wei'),
      });

      (await walletBalance.delta()).should.be.bignumber.equal(ethAmount1.toFixed('wei'));

      const { logs: logs2 } = await this.sale.buyTokens(purchaser, { from: purchaser, value: ethAmount2.toFixed('wei') });

      expectEvent.inLogs(logs2, 'TokensPurchased', {
        purchaser: purchaser,
        beneficiary: purchaser,
        value: ethAmount2.toFixed('wei'),
        amount: tokenAmount2.toFixed('wei'),
      });

      (await walletBalance.delta()).should.be.bignumber.equal(ethAmount2.toFixed('wei'));
    });
  });

  describe('price precision', function () {
    for (let i = 0; i < caps.length; i++) {
      const purchaser = purchasers[i];
      const rate = rates[i];
      const cap = caps[i];

      it(`token amount must be well calculated with (rate=${rate.toString(10)}, cap=${cap.toString(10)})`, async function () {
        const ethAmount = cap;
        const tokenAmount = ethAmount.times(rate); ;

        await this.sale.setCapAndPrice(purchaser, cap.toFixed('wei'), rate.toFixed('wei'));

        const { logs } = await this.sale.buyTokens(purchaser, { from: purchaser, value: ethAmount.toFixed('wei') });

        expectEvent.inLogs(logs, 'TokensPurchased', {
          purchaser: purchaser,
          beneficiary: purchaser,
          value: ethAmount.toFixed('wei'),
          amount: tokenAmount.toFixed('wei'),
        });

        const tokens = await this.token.balanceOf(purchaser);
        tokens.should.be.bignumber.equal(tokenAmount.toFixed('wei'));
      });
    }

    for (const purchaser of purchasers) {
      const rate = PTON2_ETH(Math.floor(Math.random() * 100) || 1);
      const cap = ETH(Math.floor(Math.random() * 100) || 1);

      it(`token amount must be well calculated with (rate=${rate.toString(10)}, cap=${cap.toString(10)})`, async function () {
        const ethAmount = cap;
        const tokenAmount = ethAmount.times(rate);

        await this.sale.setCapAndPrice(purchaser, cap.toFixed('wei'), rate.toFixed('wei'));

        const { logs } = await this.sale.buyTokens(purchaser, { from: purchaser, value: ethAmount.toFixed('wei') });

        expectEvent.inLogs(logs, 'TokensPurchased', {
          purchaser: purchaser,
          beneficiary: purchaser,
          value: ethAmount.toFixed('wei'),
          amount: tokenAmount.toFixed('wei'),
        });

        const tokens = await this.token.balanceOf(purchaser);
        tokens.should.be.bignumber.equal(tokenAmount.toFixed('wei'));
      });
    }
  });

  it('should accept payments', async function () {
    purchasers.length.should.be.gt(payments.length, `use more than ${payments.length} accounts in testrpc`);

    const totalSupply = await this.token.totalSupply();

    const totalSupplyPTON2 = PTON2(totalSupply.toString(10), 'wei');
    let totalFundedETH = ETH('0');
    let totalTransferedPTON2 = PTON2('0');

    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i];

      const {
        ethAmount,
        tokenAmount,
        rate,
        caption,
      } = payment;

      const _ETH1 = ETH('0.03'); // test payment (0.03 ETH)
      const _ETH2 = ethAmount.minus(_ETH1);

      const _PTON21 = _ETH1.times(rate);
      const _PTON22 = _ETH2.times(rate);

      const expectedPTON2 = ethAmount.times(rate);

      const data = [
        ['NAME', 'WEI', 'SYMBOL'],
        ['rate', rate.toFixed('wei'), rate.toString(10)],
        ['', '', ''],
        ['test payment (0.03 ETH)', _ETH1.toFixed('wei'), _ETH1.toString(10)],
        ['rest of cap', _ETH2.toFixed('wei'), _ETH2.toString(10)],
        ['cap', ethAmount.toFixed('wei'), ethAmount.toString(10)],
        ['', '', ''],
        ['PTON2 for test payment (0.03 ETH)', _PTON21.toFixed('wei'), _PTON21.toString(10)],
        ['PTON2 for rest of cap', _PTON22.toFixed('wei'), _PTON22.toString(10)],
        ['PTON2 for cap', tokenAmount.toFixed('wei'), tokenAmount.toString(10)],
        ['', '', ''],
        ['Expected PTON2', expectedPTON2.toFixed('wei'), expectedPTON2.toString(10)],
      ];

      console.log('');
      console.log(`Test Payment#${String(i).padEnd(2)}${caption && ` - ${caption}`}`);
      console.log('-'.repeat(115));
      console.log(table(data, paymentConfig));

      toBN(tokenAmount.toFixed('wei')).sub(toBN(expectedPTON2.toFixed('wei'))).abs()
        .should.be.bignumber.lte(e);

      totalSupply.should.be.bignumber.gte(
        totalTransferedPTON2.toFixed('wei'),
        `${i}th purchaser cannot buy tokens more than total supply`,
      );

      const purchaser = purchasers[i];

      await this.sale.setCapAndPrice(purchaser, ethAmount.toFixed('wei'), rate.toFixed('wei'));

      const { logs: logs1 } = await this.sale.buyTokens(purchaser, { from: purchaser, value: _ETH1.toFixed('wei') });

      expectEvent.inLogs(logs1, 'TokensPurchased', {
        purchaser: purchaser,
        beneficiary: purchaser,
        value: _ETH1.toFixed('wei'),
        amount: _PTON21.toFixed('wei'),
      });

      (await this.token.balanceOf(purchaser)).sub(toBN(_PTON21.toFixed('wei'))).abs()
        .should.be.bignumber.lte(e);

      const { logs: logs2 } = await this.sale.buyTokens(purchaser, { from: purchaser, value: _ETH2.toFixed('wei') });

      expectEvent.inLogs(logs2, 'TokensPurchased', {
        purchaser: purchaser,
        beneficiary: purchaser,
        value: _ETH2.toFixed('wei'),
        // amount: _PTON22.toFixed('wei'),
      });

      const purchserBalance = await this.token.balanceOf(purchaser);

      purchserBalance.sub(toBN(tokenAmount.toFixed('wei'))).abs()
        .should.be.bignumber.lte(e);

      const result = [
        ['Funded ETH', ethAmount.toString(10)],
        ['Trasnered PTON2', PTON2(purchserBalance.toString(10), 'wei').toString(10)],
      ];

      console.log(table(result, summaryConfig));
      console.log(payment.toSetCapAndPriceParams());
      console.log();

      totalFundedETH = totalFundedETH.plus(ethAmount);
      totalTransferedPTON2 = totalTransferedPTON2.plus(PTON2(purchserBalance.toString(10), 'wei'));
    }

    console.log('Payments Summary');
    console.log('-'.repeat(115));

    const summary = [
      ['Funded ETH', totalFundedETH.toString(10)],
      ['Trasnered PTON2', totalTransferedPTON2.toString(10)],
      ['Trasnered PTON2 (%)', (totalTransferedPTON2.div(totalSupplyPTON2).times(PTON2('100'))).toFixed() + '%'],
    ];

    console.log(table(summary, summaryConfig));
  });
});
