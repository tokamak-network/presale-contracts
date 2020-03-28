const { table } = require('table');
const { createCurrency, createCurrencyRatio } = require('@makerdao/currency');

const VestingToken = artifacts.require('VestingToken');
const Privatesale = artifacts.require('Privatesale');

const PTON = createCurrency('PTON');
const ETH = createCurrency('ETH');
const PTON_ETH = createCurrencyRatio(PTON, ETH);

// KYC list
const list = [
  // 100&100: 5 payments
  {
    purchaser: '0x1c0a5Dbec8A67490013e96eDbcc18fAcd90dcDa7',
    _ETH: ETH('600.00000000000'),
    _PTON: PTON('9024.000000'),
    _PTON_ETH: PTON_ETH('15.040000'),
  },
  {
    purchaser: '0x32C5cc35c5696953162004b666712d28BF89a125',
    _ETH: ETH('717.38000000000'),
    _PTON: PTON('10789.395200'),
    _PTON_ETH: PTON_ETH('15.040000'),
  },

  {
    purchaser: '0x5D76EA2Fca6e00CfF91588eabF4DE37bAfd73469',
    _ETH: ETH('500.00000000000'),
    _PTON: PTON('7520.000000'),
    _PTON_ETH: PTON_ETH('15.040000'),
  },
  {
    purchaser: '0x3F17EdC8Cf0Eb20f011C7ecE6C1c4C1fC84eCF00',
    _ETH: ETH('500.00000000000'),
    _PTON: PTON('7520.000000'),
    _PTON_ETH: PTON_ETH('15.040000'),
  },
  {
    purchaser: '0x72cCC4BEDE1a7d09aa20d97355543d0640c661F1',
    _ETH: ETH('342.20000000000'),
    _PTON: PTON('5146.688000'),
    _PTON_ETH: PTON_ETH('15.040000'),
  },
  // Mr. Jeon
  {
    purchaser: '0x443a8e36753ccd89108f1b0fc92f24eea7c7fdbc',
    _ETH: ETH('783.33072223092600'),
    _PTON: PTON('12000.000000'),
    _PTON_ETH: PTON_ETH('15.319200'),
  },
  // GLP: 2 payments
  {
    purchaser: '0x6765715Ed59CCBa57204704Cdb0A442f7f643041',
    _ETH: ETH('317.32333192300'),
    _PTON: PTON('4799.95964800'),
    _PTON_ETH: PTON_ETH('15.126400'),
  },
  {
    purchaser: '0x9f42C2886BF25fe99D5dF51eE0a653903C92131F',
    _ETH: ETH('740.43'),
    _PTON: PTON('11200.04035200'),
    _PTON_ETH: PTON_ETH('15.126400'),
  },
];

const main = async function () {
  const psale = await Privatesale.deployed();

  console.log(`Privatesale contract deployed at ${psale.address}`);

  const kycSummaryConfig = {
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

  const kycSummary = [
    ['NAME', 'WEI or ADDRESS', 'SYMBOL'],
  ];

  const registeredConfig = {
    columns: {
      0: {
        width: 25,
      },
      1: {
        width: 45,
        alignment: 'right',
      },
      2: {
        width: 45,
        alignment: 'right',
      },
      3: {
        width: 10,
        alignment: 'right',
      },
    },
  };

  const registered = [
    ['NAME', 'EXPECTED', 'ACTUAL', 'SAME'],
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

    console.log(`[Payment${i}: ${purchaser}] ${skip ? 'purchaser already registered' : 'registering...'}`);

    if (!skip) {
      kycSummary.push([`Payment#${i} Address`, purchaser, '']);
      kycSummary.push([`Payment#${i} ETH Cap`, _ETH.toFixed('wei'), _ETH.toString()]);
      kycSummary.push([`Payment#${i} PTON/ETH Rate`, _PTON_ETH.toFixed('wei'), _PTON_ETH.toString()]);
      kycSummary.push([`Payment#${i} expected PTON`, expectedPTON.toFixed('wei'), expectedPTON.toString()]);

      kycSummary.push(['', '', '']);

      try {
        await psale.setCapAndPrice(purchaser, _ETH.toFixed('wei'), _PTON_ETH.toFixed('wei'));
      } catch (e) {
        const failed = [
          ['NAME', 'EXPECTED', 'ACTUAL', 'SAME'],
          [`Payment#${i} Address`, purchaser, ''],
          [`Payment#${i} ETH Cap`, _ETH.toFixed('wei'), _ETH.toString()],
          [`Payment#${i} PTON/ETH Rate`, _PTON_ETH.toFixed('wei'), _PTON_ETH.toString()],
          [`Payment#${i} expected PTON`, expectedPTON.toFixed('wei'), expectedPTON.toString()],
        ];

        console.error(table(failed, kycSummaryConfig));
        console.error('Failed to send transaction:' + e.message);

        process.exit(-1);
      }
    }

    const aETH = ETH((await psale.getCap(purchaser)).toString(10), 'wei');
    const aPTON_ETH = PTON_ETH((await psale.getPrice(purchaser)).toString(10), 'wei');

    registered.push([`Payment#${i} Address`, '', purchaser, '']);
    registered.push([`Payment#${i} ETH Cap`,
      `${_ETH.toFixed('wei')} (${_ETH.toString()})`,
      `${aETH.toFixed('wei')} (${aETH.toString()})`,
      _ETH.toFixed('wei') === aETH.toFixed('wei'),
    ]);
    registered.push([`Payment#${i} PTON/ETH Rate`,
      `${_PTON_ETH.toFixed('wei')} (${_PTON_ETH.toString()})`,
      `${aPTON_ETH.toFixed('wei')} (${aPTON_ETH.toString()})`,
      _PTON_ETH.toFixed('wei') === aPTON_ETH.toFixed('wei'),
    ]);
    registered.push(['', '', '', '']);

    i++;
  }

  console.log(`
#####################################
#  KYC Summary (transaction-based)  #
#####################################`);
  console.log(table(kycSummary, kycSummaryConfig));

  console.log(`
######################
#  Total KYC Result  #
######################`);
  console.log(table(registered, registeredConfig));
};

module.exports = function (cb) {
  main().then(cb).catch(cb);
};
