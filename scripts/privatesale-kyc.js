const { table } = require('table');
const { createCurrency, createCurrencyRatio } = require('@makerdao/currency');

const VestingToken = artifacts.require('VestingToken');
const Privatesale = artifacts.require('Privatesale');

const PTON = createCurrency('PTON');
const ETH = createCurrency('ETH');
const PTON_ETH = createCurrencyRatio(PTON, ETH);

// KYC list
const list = [
  {
    purchaser: '0x45c74a158de2ff63703669414a0e0411b85b5dad',
    _PTON_ETH: PTON_ETH('15.040000000000000000'),
    _ETH: ETH('2127.65957446809'),
    // _PTON: PTON('32000'),
  },
];

const main = async function () {
  const psale = await Privatesale.deployed();

  console.log(`Privatesale contract deployed at ${psale.address}`);

  const paymentConfig = {
    columns: {
      0: {
        width: 25,
      },
      1: {
        width: 45,
        alignment: 'right',
      },
      2: {
        width: 15,
        alignment: 'right',
      },
    },
  };

  const data = [
    ['NAME', 'WEI or ADDRESS', 'SYMBOL'],
  ];

  let i = 0;
  for (const l of list) {
    const {
      purchaser,
      _ETH,
      _PTON_ETH,
    } = l;

    const expectedPTON = _ETH.times(_PTON_ETH);

    const skip = !(await psale.getCap(purchaser)).isZero();

    console.log(`[Payment${i}: ${purchaser}] ${skip ? 'purchaser already registered' : ''}`);

    if (skip) continue;

    await psale.setCapAndPrice(purchaser, _ETH.toFixed('wei'), _PTON_ETH.toFixed('wei'));
    data.push([`Payment#${i} Address`, purchaser, '']);
    data.push([`Payment#${i} ETH Cap`, _ETH.toFixed('wei'), _ETH.toString()]);
    data.push([`Payment#${i} PTON/ETH Rate`, _PTON_ETH.toFixed('wei'), _PTON_ETH.toString()]);
    data.push([`Payment#${i} expected PTON`, expectedPTON.toFixed('wei'), expectedPTON.toString()]);

    data.push(['', '', '']);

    i++;
  }

  console.log(table(data, paymentConfig));
};

module.exports = function (cb) {
  main().then(cb).catch(cb);
};
