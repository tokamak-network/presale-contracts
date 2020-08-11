/// / Things to do
// 1.VestingTokenStep.owner should be simpleSwapper
// 2.VestingTokenStep.init() should be called
// 3.VestingToken.owner should be zero-address
// 4.Each of VestingTokens in VestingSwapper should be inited

/// / 1.Accounts Address ////
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ZERO_ONE_ADDRESS = '0x0000000000000000000000000000000000000001';
const TEAM_TON_HOLDER = '0xB2E518b841b0Cb7124dDaDcbb882BbCED4337cBf';
const BIZ_TON_HOLDER = '0x36f917BBd70d31F0501fCe2Cd1756A977d783E44';
const DAO_TON_HOLDER = '0x6d6231121807cEaE402F355B76eEbCCb7EA21806';
const MTON_HOLDER1 = '0x32e95D328A6bD3D0966b34026b929833015e70C2';
const MTON_HOLDER2 = '0x340C44089bc45F86060922d2d89eFee9e0CDF5c7';
const RTON_HOLDER = '0x2Db13E39eaf889A433E0CB23C38520419eC37202';
const ATON_HOLDER = '0x33c0e0cf845502EDa9873E8Ab1Da1DaF5a47eac6';
const TON_VAULT_OWNER = '0xBB6b2fCCC6AA3518FBE36F739A7dE048e814998A';
const TON_OWNER = '0xC8F4035b79cB95fA18F9BAa9C457843954C28233';

/// / 2.Contract Addresses ////
// vestingToken, have to use vestingSwapper(Don't have to init token itself).
const SEED_TON = '0x8Ae43F11DDd3fac5bbD84ab0BA795E1e51b78df7';
const PRIVATE_TON = '0x2C0F8e85ad3DCbEc1561f6cE632DFF86294e479f';
const STRATEGIC_TON = '0x2801265c6f888f5a9e1b72ee175fc0091e007080';

// vestingTokenStep, use simpleSwapper(It should be inited itself).
const MARKETING_TON = '';
const DAO_TON = '';
const TEAM_TON = '';
const ADVISOR_TON = '';
const BUSINESS_TON = '';
const RESERVE_TON = '';

// target token : TON
const TON = '';

// vault and swappers
const TON_VAULT = '';
const SIMPLE_SWAPPER = '';
const VESTING_SWAPPER = '';

// seigManager contract
const SEIG_MANAGER = '0x2104cEC955b6FaBF603d8B2Ee0c28EA88886fa8C';

/// / 3. Swaps and Vestings ////

// https://docs.google.com/spreadsheets/d/1o3MXV9ajux3H2aL7mRZRi343DrjoefgOeC9HR1xkXQk/edit#gid=556573766

// 3.1 Swap ratios
const MTON_RATIO = 1;
const SOURCE_RATIO = 50;

// 3.2 Vesting timestamp related
const START_TIMESTAMP = 1597201200; // 2020. 8. 12 오후 12:00:00(KST)

const TEAM_START = '1612728000'; // 2021. 2. 8 오전 5:00:00(KST)
const ADVISOR_START = '1612728000'; // 2021. 2. 8 오전 5:00:00(KST)
const MARKETING_START_SIMPLE = '1599768000'; // 2020. 9. 11 오전 5:00:00(KST)
const BUSINNESS_START = '1599768000'; // 2020. 9. 11 오전 5:00:00(KST)
const RESERVE_START = '1628280000'; // 2021. 8. 7 오전 5:00:00(KST)
const DAO_START = '1610136000'; // 2021. 1. 9 오전 5:00:00(KST)

const month = 60 * 60 * 24 * 30; // 30days
const day = 60 * 60 * 24; // 1day
const hour = 60 * 60; // 1hour

const SEED_DURATION = 7 * month - 7 * hour;
const PRIVATE_DURATION = 11 * month - 7 * hour;
const STRATEGIC_DURATION = 11 * month - 7 * hour;
const TEAM_DURATION = 35 * month;
const ADVISOR_DURATON = 18 * month;
const MARKETING_DURATION_SIMPLE = 0;
const MARKETING_DURATOON_VESTING_SWAPPER = 10 * month;
const BIZ_DURATION = 20 * month;
const RESERVE_DURATION = 30 * month;
const DAO_DURATION = 0;

const CLIFF_DURATION_STEP_TOKEN = 0; //

// 3.3 Vesting swapper related
const END_CLIFF_TIME = 1599768000;
const FIRST_SEED_AMOUNT = '15000000000000000000000';
const FIRST_PRIVATE_AMOUNT = '360000000000000000000000';
const FIRST_STRATEGIC_AMOUNT = '378000000000000000000000';

// 3.3.1 seedTON
const SEED_START = START_TIMESTAMP;
const SEED_CLIFF_DURATION_IN_SECONDS = '?';
const SEED_FIRST_CLAIM_DURATION_IN_SECONDS = '?';
const SEED_FIRST_CLAIM_AMOUNT = FIRST_SEED_AMOUNT / SOURCE_RATIO;
const SEED_DURATION_UNIT = 6;

// 3.3.2 privateTON
const PRIVATE_START = START_TIMESTAMP;
const PRIVATE_CLIFF_DURATION_IN_SECONDS = '?';
const PRIVATE_FIRST_CLAIM_DURATION_IN_SECONDS = '?';
const PRIVATE_FIRST_CLAIM_AMOUNT = FIRST_PRIVATE_AMOUNT / SOURCE_RATIO;
const PRIVATE_DURATION_UNIT = 10;

// 3.3.3 strategicTON
const STRATEGIC_START = START_TIMESTAMP;
const STRATEGIC_CLIFF_DURATION_IN_SECONDS = '?';
const STRATEGIC_FIRST_CLAIM_DURATION_IN_SECONDS = '?';
const STRATEGIC_FIRST_CLAIM_AMOUNT = FIRST_STRATEGIC_AMOUNT / SOURCE_RATIO;
const STRATEGIC_DURATION_UNIT = 10;

// 3.3.4 marketingTON
const MARKETING_START = START_TIMESTAMP;
const MARKETING_CLIFF_DURATION_IN_SECONDS = '?';
const MARKETING_FIRST_CLAIM_DURATION_IN_SECONDS = '?';
const MARKETING_FIRST_CLAIM_AMOUNT = '?';
const MARKETING_DURATION_UNIT = '?';

// amount to be minted
const GENERATED_MTON = '1064393 ' + '685257319142626689'; // wei, 2600000 - (1515283.424251996524338723 + 20322.890490684333034588187841973)
const GENERATED_DAO_TON = '350000' + '000000000000000000'; // wei
const GENERATED_TEAM_TON = '150000' + '000000000000000000'; // wei
const GENERATED_ADVISOR_TON = '30000' + '000000000000000000'; // wei
const GENERATED_BIZ_TON = '100000' + '000000000000000000'; // wei
const GENERATED_RESERVE_TON = '60000' + '000000000000000000'; // wei
const GENERATED_TON = '50000000' + '000000000000000000'; // wei

// Vault approve amount

// VestingSwapperApproved = (STON + PTON + STTON)*50 + FirstCliffMTON
// = (30000 + 144000.083230664748493368 + 84000.1)*50 + 200200
// = 13100209.1615332374246684
const APPROVE_VESTING_SWAPPER = '13100209' + '1615332374246684'; // wei

// SimpleSwapperApproved = TON.totalSupply - VestingSwapperApproved
// = 50000000 - 13100209.1615332374246684
// = 36899790.8384667625753316
const APPROVE_SIMPLE_SWAPPER = '36899790' + '8384667625753316'; // wei

const data = {
  'marketingTON': {
    'type': 'MTON.sol',
    'actions': [
      '.generateTokens(mtonHolder, generatedAmount)',
    ],
    'parameters': {
      'mtonHolder': MTON_HOLDER1,
      'generatedAmount': GENERATED_MTON, // should be wei
    },
  },

  'daoTON': {
    'type': 'VestingTokenStep.sol',
    'actions': [
      'deploy daoTON(tokenFactory, parentToken, parentSnapShotBlock, tokenName, decimalUnits, tokenSymbol, transfersEnabled)',
      '.generateTokens(daoTONHolder, generatedAmount)',
    ],
    'parameters': {
      'constructor': {
        'tokenFactory': ZERO_ADDRESS,
        'parentToken': ZERO_ADDRESS,
        'parentSnapShotBlock': 0,
        'tokenName': 'DAO Tokamak Network Token',
        'decimalUnits': 18,
        'transferEnabled': true,
      },
      'daoTONHolder': DAO_TON_HOLDER,
      'generatedAmount': GENERATED_DAO_TON, // should be Wei
    },
  },

  'teamTON': {
    'type': 'VestingTokenStep.sol',
    'actions': [
      'deploy teamTON(tokenFactory, parentToken, parentSnapShotBlock, tokenName, decimalUnits, tokenSymbol, transfersEnabled)',
      '.generateTokens(teamTONHolder, generatedAmount)',
    ],
    'parameters': {
      'constructor': {
        'tokenFactory': ZERO_ADDRESS,
        'parentToken': ZERO_ADDRESS,
        'parentSnapShotBlock': 0,
        'tokenName': 'Team Tokamak Network Token',
        'decimalUnits': 18,
        'transferEnabled': true,
      },
      'teamTONHolder': TEAM_TON_HOLDER,
      'generatedAmount': GENERATED_TEAM_TON, // Not Wei
    },
  },

  'advisorTON': {
    'type': 'VestingTokenStep.sol',
    'actions': [
      'deploy advisorTON(tokenFactory, parentToken, parentSnapShotBlock, tokenName, decimalUnits, tokenSymbol, transfersEnabled)',
      '.generateTokens(advisorTONHolder, generatedAmount)',
    ],
    'parameters': {
      'constructor': {
        'tokenFactory': ZERO_ADDRESS,
        'parentToken': ZERO_ADDRESS,
        'parentSnapShotBlock': 0,
        'tokenName': 'Advisor Tokamak Network Token',
        'decimalUnits': 18,
        'transferEnabled': true,
      },
      'advisorTONHolder': ATON_HOLDER,
      'generatedAmount': GENERATED_ADVISOR_TON, // Not Wei
    },
  },

  'businessTON': {
    'type': 'VestingTokenStep.sol',
    'actions': [
      'deploy businessTON(tokenFactory, parentToken, parentSnapShotBlock, tokenName, decimalUnits, tokenSymbol, transfersEnabled)',
      '.generateTokens(bisinessTONHolder, generatedAmount)',
    ],
    'parameters': {
      'constructor': {
        'tokenFactory': ZERO_ADDRESS,
        'parentToken': ZERO_ADDRESS,
        'parentSnapShotBlock': 0,
        'tokenName': 'business Tokamak Network Token',
        'decimalUnits': 18,
        'transferEnabled': true,
      },
      'bisinessTONHolder': BIZ_TON_HOLDER,
      'generatedAmount': GENERATED_BIZ_TON, // Not Wei
    },
  },

  'reserveTON': {
    'type': 'VestingTokenStep.sol',
    'actions': [
      'deploy reserveTON(tokenFactory, parentToken, parentSnapShotBlock, tokenName, decimalUnits, tokenSymbol, transfersEnabled)',
      '.generateTokens(reserveTONHolder, generatedAmount)',
    ],
    'parameters': {
      'constructor': {
        'tokenFactory': ZERO_ADDRESS,
        'parentToken': ZERO_ADDRESS,
        'parentSnapShotBlock': 0,
        'tokenName': 'Reserve Tokamak Network Token',
        'decimalUnits': 18,
        'transferEnabled': true,
      },
      'reserveTONHolder': RTON_HOLDER,
      'generatedAmount': GENERATED_RESERVE_TON, // Not Wei
    },
  },
  'ton': {
    'type': 'TON.sol',
    'actions': [
      'deploy.TON()',
    ],
    'parameters': {},
  },
  'simpleSwapper': {
    'type': 'Swapper.sol',
    'address': SIMPLE_SWAPPER,
    'startTimeStamp': START_TIMESTAMP,
    'actions': [
      'deploy simpleswapper(TONAddress, MTONAddress)',
      '.setVault(valutAddress)',
      '.updateRatio(marketingTON, marketingRatio)',
      '.updateRatio(teamTON, teamRatio)',
      '.updateRatio(advisorTON, advisorRatio)',
      '.updateRatio(businessTON, businessRatio)',
      '.updateRatio(reserveTON, reserveRatio)',
      '.updateRatio(daoTON, daoRatio)',
      'MTON.initiate(start, cliffDuration, duration)',
      'TTON.initiate(start, cliffDuration, duration)',
      'ATON.initiate(start, cliffDuration, duration)',
      'BTON.initiate(start, cliffDuration, duration)',
      'RTON.initiate(start, cliffDuration, duration)',
      'DTON.initiate(start, cliffDuration, duration)',
    ],
    'parameters': {
      'TONAddress': TON,
      'MTONAddress': MARKETING_TON,
      'valutAddress': TON_VAULT,
      'MTON': { // swap any amount, any time
        'marketingTON': MARKETING_TON,
        'marketingRatio': MTON_RATIO,
        'start': MARKETING_START_SIMPLE,
        'cliffDuration': CLIFF_DURATION_STEP_TOKEN,
        'duration': MARKETING_DURATION_SIMPLE,
      },
      'TeamTON': {
        'teamTON': TEAM_TON,
        'teamRatio': SOURCE_RATIO,
        'start': TEAM_START,
        'cliffDurationInSeconds': CLIFF_DURATION_STEP_TOKEN,
        'duration': TEAM_DURATION,
      },
      'AdvisorTON': {
        'advisorTON': ADVISOR_TON,
        'advisorRatio': SOURCE_RATIO,
        'start': ADVISOR_START,
        'cliffDurationInSeconds': CLIFF_DURATION_STEP_TOKEN,
        'duration': ADVISOR_DURATON,
      },
      'BusinessTON': {
        'businessTON': BUSINESS_TON,
        'businessRatio': SOURCE_RATIO,
        'start': BUSINNESS_START,
        'cliffDurationInSeconds': CLIFF_DURATION_STEP_TOKEN,
        'duration': BIZ_DURATION,
      },
      'ReserveTON': {
        'reserveTON': RESERVE_TON,
        'reserveRatio': SOURCE_RATIO,
        'start': RESERVE_START,
        'cliffDurationInSeconds': CLIFF_DURATION_STEP_TOKEN,
        'duration': RESERVE_DURATION,
      },
      'DaoTON': {
        'daoTON': DAO_TON,
        'daoRatio': SOURCE_RATIO,
        'start': DAO_START,
        'cliffDurationInSeconds': CLIFF_DURATION_STEP_TOKEN,
        'duration': DAO_DURATION,
      },
    },
  },

  'vestingSwapper': {
    'address': VESTING_SWAPPER,
    'startTimeStamp': START_TIMESTAMP,
    'actions': [
      'deploy vestingSwapper(TONAddress, MTONAddress)',
      '.setVault(vaultAddress)',
      '.initiate(seedTON, start, cliffDurationInSeconds, firstClaimDurationInSeconds, firstClaimAmount, durationUnit)',
      '.initiate(privateTON, start, cliffDurationInSeconds, firstClaimDurationInSeconds, firstClaimAmount, durationUnit)',
      '.initiate(strategicTON, start, cliffDurationInSeconds, firstClaimDurationInSeconds, firstClaimAmount, durationUnit)',
      '.initiate(marketingTON, start, cliffDurationInSeconds, firstClaimDurationInSeconds, firstClaimAmount, durationUnit)',
      '.updateRatio(seedTON, seedRatio)',
      '.updateRatio(privateTON, seedRatio)',
      '.updateRatio(strategicTON, strategicRatio)',
      '.updateRatio(marketingTON, marketingRatio)',
      '.setStart(startTimestamp)',
    ],
    'TONAddress': TON,
    'MTONAddress': MARKETING_TON,
    'vaultAddress': TON_VAULT,
    'seedTON': {
      'seedTON': SEED_TON,
      'seedRatio': SOURCE_RATIO,
      'start': SEED_START,
      'cliffDurationInSeconds': SEED_CLIFF_DURATION_IN_SECONDS,
      'firstClaimDurationInSeconds': SEED_FIRST_CLAIM_DURATION_IN_SECONDS,
      'firstClaimAmount': SEED_FIRST_CLAIM_AMOUNT,
      'durationUnit': SEED_DURATION_UNIT,
    },
    'privateTON': {
      'privateTON': PRIVATE_TON,
      'privateRatio': SOURCE_RATIO,
      'start': PRIVATE_START,
      'cliffDurationInSeconds': PRIVATE_CLIFF_DURATION_IN_SECONDS,
      'firstClaimDurationInSeconds': PRIVATE_FIRST_CLAIM_DURATION_IN_SECONDS,
      'firstClaimAmount': PRIVATE_FIRST_CLAIM_AMOUNT,
      'durationUnit': PRIVATE_DURATION_UNIT,
    },
    'strategicTON': {
      'strategicTON': STRATEGIC_TON,
      'strategicRatio': SOURCE_RATIO,
      'start': STRATEGIC_START,
      'cliffDurationInSeconds': STRATEGIC_CLIFF_DURATION_IN_SECONDS,
      'firstClaimDurationInSeconds': STRATEGIC_FIRST_CLAIM_DURATION_IN_SECONDS,
      'firstClaimAmount': STRATEGIC_FIRST_CLAIM_AMOUNT,
      'durationUnit': STRATEGIC_DURATION_UNIT,
    },
    'marketingTON': {
      'marketingTON': MARKETING_TON,
      'marketingRatio': MTON_RATIO,
      'start': MARKETING_START,
      'cliffDurationInSeconds': MARKETING_CLIFF_DURATION_IN_SECONDS,
      'firstClaimDurationInSeconds': MARKETING_FIRST_CLAIM_DURATION_IN_SECONDS,
      'firstClaimAmount': MARKETING_FIRST_CLAIM_AMOUNT,
      'durationUnit': MARKETING_DURATION_UNIT,
    },
  },

  'valut': {
    'type': 'TONVault.sol',
    'actions': [
      'deploy.TONValut(TONAddress)',
      '.setApproveAmount(vestingSwapper, vestingSwapperAmount)',
      '.setApproveAmount(simpleSwapper, simpleSwapperAmount)',
    ],
    'parameters': {
      'TONAddress': TON,
      'vestingSwapper': VESTING_SWAPPER,
      'vestingSwapperAmount': APPROVE_VESTING_SWAPPER,
      'simpleSwapper': SIMPLE_SWAPPER,
      'simpleSwapperAmount': APPROVE_SIMPLE_SWAPPER,
    },
  },

  'mintTON': {
    'actions': [
      '.mint(tonVaultAddress, amountToMint)',
    ],
    'parameters': {
      'tonVaultAddress': TON_VAULT,
      'amountToMint': GENERATED_TON, // should be wei
    },
  },

  'ownership': {
    'actions': [
      'SEED_TON.changeController(ZERO_ADDRESS)', // zoro-address
      'STRATEGIC_TON.changeController(ZERO_ADDRESS)', // zero-address
      'MTON.changeController(ZERO_ADDRESS)', // zero-address
      'seigManager.renounceOwner()', // zero-address

      'DAO_TON.changeController(SIMPLE_SWAPPER)', // simpleSwapper
      'TEAM_TON.changeController(SIMPLE_SWAPPER)', // simpleSwapper
      'ADVISOR_TON.changeController(SIMPLE_SWAPPER)', // simpleSwapper
      'BUSINESS_TON.changeController(SIMPLE_SWAPPER)', // simpleSwapper
      'RESERVE_TON.changeController(SIMPLE_SWAPPER)', // simpleSwapper

      'TON.transferOwnership(TONOwner)', // TON_OWNER
      'TON_VAULT.transferPrimary(ZERO_ADDRESS)', // zero-address

      'SIMPLE_SWAPPER.changeController(ZERO_ADDRESS)', // zero-address
      'VESTING_SWAPPER.transferPrimary(ZERO_ONE_ADDRESS)', // zero-one-address
    ],
    'parameters': {
      'ZERO_ADDRESS': ZERO_ADDRESS,
      'SIMPLE_SWAPPER': SIMPLE_SWAPPER,
      'TONOwner': TON_OWNER,
      'ZERO_ONE_ADDRESS': ZERO_ONE_ADDRESS,
    },
  },
};

module.exports = data;
