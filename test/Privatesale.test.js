const { table } = require('table');
const { createCurrency, createCurrencyRatio } = require('@makerdao/currency');

const { BN, balance, constants, ether, expectEvent, expectRevert, send } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const VestingToken = artifacts.require('VestingToken');
const Privatesale = artifacts.require('Privatesale');

const chai = require('chai');

chai.should();

const { toBN } = web3.utils;

const PTON = createCurrency('PTON');
const ETH = createCurrency('ETH');
const PTON_ETH = createCurrencyRatio(PTON, ETH);

// token amount calculation error
const e = ether('0.0001');

const payments = [
  // 1st payment
  {
    _PTON_ETH: PTON_ETH('15.040000000000000000'),
    _PTON: PTON('32000'),
    _ETH: ETH('2127.65957446809'),
  },
];

contract('Privatesale', function ([owner, wallet, ...purchasers]) {
  const rates = [
    PTON_ETH('10.15'),
    PTON_ETH('20'),
  ];
  const caps = [
    ETH('300'),
    ETH('600'),
  ];

  const totalSupply = ether('224000');

  let smallPayment;

  beforeEach(async function () {
    this.token = await VestingToken.new(
      ZERO_ADDRESS, ZERO_ADDRESS, 0, 'PTON test token', 18, 'PTON-test', true, { from: owner }
    );

    this.sale = await Privatesale.new(
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
        'Privatesale: wei amount should be equal to purchaser cap or equal to 0.03 ether',
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

      it(`token amount must be well calculated with (rate=${rate.toFixed()}, cap=${cap.toFixed()})`, async function () {
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
      const rate = PTON_ETH(Math.floor(Math.random() * 100) || 1);
      const cap = ETH(Math.floor(Math.random() * 1000) || 1);

      it(`token amount must be well calculated with (rate=${rate.toFixed()}, cap=${cap.toFixed()})`, async function () {
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

    let totalFundedETH = ETH('0');
    let totalTransferedPTON = PTON('0');

    const config = {
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

    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i];

      const {
        _ETH,
        _PTON_ETH,
        _PTON,
      } = payment;

      const _ETH1 = ETH('0.03'); // small payment
      const _ETH2 = _ETH.minus(_ETH1);

      const _PTON1 = _ETH1.times(_PTON_ETH);
      const _PTON2 = _ETH2.times(_PTON_ETH);

      const dataInWei = [
        ['NAME', 'WEI'],
        ['rate', _PTON_ETH.toFixed('wei')],
        ['', ''],
        ['small payment', _ETH1.toFixed('wei')],
        ['rest of cap', _ETH2.toFixed('wei')],
        ['cap', _ETH.toFixed('wei')],
        ['', ''],
        ['PTON for small payment', _PTON1.toFixed('wei')],
        ['PTON for rest of cap', _PTON2.toFixed('wei')],
        ['PTON for cap', _PTON.toFixed('wei')],
      ];

      const dataInSymbol = [
        ['NAME', 'SYMBOL'],
        ['rate', _PTON_ETH.toString(10)],
        ['', ''],
        ['small payment', _ETH1.toString(10)],
        ['rest of cap', _ETH2.toString(10)],
        ['cap', _ETH.toString(10)],
        ['', ''],
        ['PTON for small payment', _PTON1.toString(10)],
        ['PTON for rest of cap', _PTON2.toString(10)],
        ['PTON for cap', _PTON.toString(10)],
      ];

      console.log('');
      console.log('Payment#1');
      console.log('-'.repeat(67));
      console.log(table(dataInWei, config));
      console.log('-'.repeat(67));
      console.log(table(dataInSymbol, config));

      // check expected PTON amount
      (_PTON.toFixed()).should.be.equal(_ETH.times(_PTON_ETH).toFixed());

      totalSupply.should.be.bignumber.gte(
        totalTransferedPTON.toFixed('wei'),
        `${i}th purchaser cannot buy tokens more than total supply`,
      );

      const purchaser = purchasers[i];

      await this.sale.setCapAndPrice(purchaser, _ETH.toFixed('wei'), _PTON_ETH.toFixed('wei'));

      const { logs: logs1 } = await this.sale.buyTokens(purchaser, { from: purchaser, value: _ETH1.toFixed('wei') });

      expectEvent.inLogs(logs1, 'TokensPurchased', {
        purchaser: purchaser,
        beneficiary: purchaser,
        value: _ETH1.toFixed('wei'),
      });

      (await this.token.balanceOf(purchaser)).sub(toBN(_PTON1.toFixed('wei'))).abs()
        .should.be.bignumber.lte(e);

      const { logs: logs2 } = await this.sale.buyTokens(purchaser, { from: purchaser, value: _ETH2.toFixed('wei') });

      expectEvent.inLogs(logs2, 'TokensPurchased', {
        purchaser: purchaser,
        beneficiary: purchaser,
        value: _ETH2.toFixed('wei'),
      });

      const purchserBalance = await this.token.balanceOf(purchaser);

      purchserBalance.sub(toBN(_PTON.toFixed('wei'))).abs()
        .should.be.bignumber.lte(e);

      const result = [
        ['Funded ETH', _ETH.toString(10)],
        ['Trasnered PTON', PTON(purchserBalance.toString(10), 'wei').toString(10)],
      ];

      console.log(table(result, config));

      totalFundedETH = totalFundedETH.plus(_ETH);
      totalTransferedPTON = totalTransferedPTON.plus(PTON(purchserBalance.toString(10), 'wei'));
    }

    console.log('Payments Summary');
    console.log('-'.repeat(67));

    const summary = [
      ['Funded ETH', totalFundedETH.toString(10)],
      ['Trasnered PTON', totalTransferedPTON.toString(10)],
    ];

    console.log(table(summary, config));
  });
});
