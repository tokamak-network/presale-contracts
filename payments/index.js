const { createCurrency, createCurrencyRatio } = require('@makerdao/currency');
const { Currency, CurrencyRatio } = require('@makerdao/currency/dist/Currency');
const { BN, toBN, toWei, isAddress } = require('web3-utils');

const ETH = createCurrency('ETH');

// private sale
const PTON = createCurrency('PTON');
const PTON_ETH = createCurrencyRatio(PTON, ETH);

// strategic sale
const STON = createCurrency('STON');
const STON_ETH = createCurrencyRatio(STON, ETH);

// private 2 sale
const PTON2 = createCurrency('PTON2');
const PTON2_ETH = createCurrencyRatio(PTON2, ETH);

function ether (n) {
  return new BN(toWei(n, 'ether'));
}

const e = ether('0.01');
const smallPayment = ether('0.03');
const smallPaymentETH = ETH(smallPayment.toString(10), 'wei');

class Payment {
  /**
   * @param {String} purchaser Ethereum address of token purchaser
   * @param {Currency} ethAmount Ether funding amount
   * @param {Currency} tokenAmount Token purchased amount
   * @param {CurrencyRatio} rate Token convetion rate over Ether
   * @param {String} caption
   */
  constructor (purchaser, ethAmount, tokenAmount, rate, caption = '') {
    if (!isAddress(purchaser)) {
      throw new Error(`invalid purchaser address: ${purchaser}`);
    }

    if (ethAmount.lte(smallPaymentETH)) {
      throw new Error(`Ether amount is smaller than small payment ${smallPaymentETH.toString()}: ${ethAmount.toString()}`);
    }

    let _v1 = toBN(ethAmount.times(rate).toFixed('wei'));
    let _v2 = toBN(tokenAmount.toFixed('wei'));

    if (_v2.cmp(_v1) > 0) {
      [ _v1, _v2 ] = [_v2, _v1];
    }

    if (_v1.sub(_v2).cmp(e) > 0) {
      throw new Error(`amount diff exceeds ${e.toString(10)} ${_v1.sub(_v2)}`);
    }

    this.purchaser = purchaser;
    this.ethAmount = ethAmount;
    this.tokenAmount = tokenAmount;
    this.rate = rate;
    this.caption = caption;
  }

  toString () {
    return `${this.purchaser} ${this.ethAmount.toString()} ${this.tokenAmount.toString()} ${this.rate.toString()};`;
  }

  toTableData () {
    const {
      ethAmount,
      tokenAmount,
      rate,
    } = this;

    const symbol = tokenAmount.symbol;

    // amounts for small payment
    const ethAmount1 = smallPaymentETH;
    const tokenAmount1 = ethAmount1.times(rate);

    // amounts for cap - small payment
    const ethAmount2 = ethAmount.minus(smallPaymentETH);
    const tokenAmount2 = ethAmount2.times(rate);

    const expectedTokenAmount = ethAmount.times(rate);

    return [
      ['NAME', 'WEI', 'SYMBOL'],
      ['rate', rate.toFixed('wei'), rate.toString(10)],
      ['', '', ''],
      ['test payment (0.03 ETH)', ethAmount1.toFixed('wei'), ethAmount1.toString(10)],
      [`${symbol} for test payment (0.03 ETH)`, tokenAmount1.toFixed('wei'), tokenAmount1.toString(10)],
      ['', '', ''],
      ['rest of cap', ethAmount2.toFixed('wei'), ethAmount2.toString(10)],
      [`${symbol} for rest of cap`, tokenAmount2.toFixed('wei'), tokenAmount2.toString(10)],
      ['', '', ''],
      ['cap', ethAmount.toFixed('wei'), ethAmount.toString(10)],
      [`${symbol} for cap`, tokenAmount.toFixed('wei'), tokenAmount.toString(10)],
      ['', '', ''],
      [`expected ${symbol}`, expectedTokenAmount.toFixed('wei'), expectedTokenAmount.toString(10)],
    ];
  }

  toSetCapAndPriceParams () {
    const {
      purchaser,
      ethAmount,
      rate,
    } = this;

    return `setCapAndPrice(${purchaser}, ${ethAmount.toFixed('wei')}, ${rate.toFixed('wei')})`;
  }
};

module.exports = {
  Payment,
  ETH,
  PTON,
  PTON_ETH,
  STON,
  STON_ETH,
  PTON2,
  PTON2_ETH,
};
