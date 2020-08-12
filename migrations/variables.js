/// / Things to do
// 1.VestingTokenStep.owner should be simpleSwapper
// 2.VestingTokenStep.init() should be called
// 3.VestingToken.owner should be zero-address
// 4.Each of VestingTokens in VestingSwapper should be inited
const { BN, constants, ether } = require('openzeppelin-test-helpers');

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
const HOLDER = '0x2b3a5A8E301e3e0aA6FACf0B2ef821b236ee5EE3';

/// / 2.Contract Addresses ////
// vestingToken, have to use vestingSwapper(Don't have to init token itself).
const SEED_TON = '0x8Ae43F11DDd3fac5bbD84ab0BA795E1e51b78df7';
const PRIVATE_TON = '0x2C0F8e85ad3DCbEc1561f6cE632DFF86294e479f';
const STRATEGIC_TON = '0x2801265c6f888f5a9e1b72ee175fc0091e007080';

// vestingTokenStep, use simpleSwapper(It should be inited itself).
const MARKETING_TON = '0xe3a87a9343D262F5f11280058ae807B45aa34669';

const DAO_TON = '0x1b20FF313638F5C3A5bD603a1861d6F839e73245';
const TEAM_TON = '0x5950181C3d6b819383Ef585db58dC61a617F8dEc';
const ADVISOR_TON = '0xa9fCb03c5bBa83153fb576288A4180882aEb2eE6';
const BUSINESS_TON = '0xD5f2dDF3E26dF4d36F8FF4Ec6279b7F870865699';
const RESERVE_TON = '0x4F92A03510842f3673350161bdA7d03BA8fCD16C';

// target token : TON
const TON = '0x7490c52916C738998f6e441Fbe1150193D5cB0AC';

// vault and swappers
const TON_VAULT = '0x52EaeeCE9BfD8782F88b6B2A709893673077EfD6';
const SIMPLE_SWAPPER = '0x2171cb136e9764DD35CEfA687145c8a87bC838Bd';
const VESTING_SWAPPER = '0xE253dAC5c5798319EAF2b7015dB8aA646De035e4';

// seigManager contract
const SEIG_MANAGER = '0x2104cEC955b6FaBF603d8B2Ee0c28EA88886fa8C';

/// / 3. Swaps and Vestings ////

// https://docs.google.com/spreadsheets/d/1o3MXV9ajux3H2aL7mRZRi343DrjoefgOeC9HR1xkXQk/edit#gid=556573766

// 3.1 Swap ratios
const MTON_RATIO = 1;
const SOURCE_RATIO = new BN('50');

// 3.2 Vesting timestamp related
const START_TIMESTAMP = new BN('1597287600'); // 2020. 8. 13 오후 12:00:00(KST)

const TEAM_START = new BN('1612814400'); // 2021. 2. 9 오전 5:00:00(KST)
const ADVISOR_START = new BN('1612814400'); // 2021. 2. 9 오전 5:00:00(KST)
const MARKETING_START_SIMPLE = new BN('1597287600'); // 2020. 8. 13 오후 12:00:00
const BUSINNESS_START = new BN('1599854400'); // 2020. 9. 12 오전 5:00:00(KST)
const RESERVE_START = new BN('1628366400'); // 2021. 8. 8 오전 5:00:00(KST)
const DAO_START = new BN('1610222400'); // 2021. 1. 10 오전 5:00:00(KST)

// const month = 60 * 60 * 24 * 30; // 30days
// const day = 60 * 60 * 24; // 1day
// const hour = 60 * 60; // 1hour

const SEED_DURATION = 6;
const PRIVATE_DURATION = 10;
const STRATEGIC_DURATION = 10;
const MARKETING_DURATOON_VESTING_SWAPPER = 10;

const TEAM_DURATION = 36; // 36month
const ADVISOR_DURATON = 18; // 18month
const MARKETING_DURATION_SIMPLE = 0;
const BIZ_DURATION = 20; // 20month
const RESERVE_DURATION = 30; // 30month
const DAO_DURATION = 1; // TODO : Test required. immediately.

const CLIFF_DURATION_STEP_TOKEN = 0; // TTON,ATON,BTON,RTON,DTON,MTON

// 3.3 Vesting swapper related
const END_CLIFF_TIME = new BN('1599854400'); // 2020. 9. 12 오전 5:00:00(KST)

const FIRST_SEED_AMOUNT = new BN('15000' + '000000000000000000');
const FIRST_PRIVATE_AMOUNT = new BN('360000' + '000000000000000000');
const FIRST_STRATEGIC_AMOUNT = new BN('378000' + '000000000000000000');

// 3.3.1 seedTON
const SEED_START = START_TIMESTAMP;
const SEED_CLIFF_DURATION_IN_SECONDS = 0;
const SEED_FIRST_CLAIM_DURATION_IN_SECONDS = END_CLIFF_TIME.sub(SEED_START); // 1599768000 - 1597201200  = 2566800
const SEED_FIRST_CLAIM_AMOUNT = FIRST_SEED_AMOUNT.div(SOURCE_RATIO); // 15000 / 50 = 300
const SEED_DURATION_UNIT = 6;

// 3.3.2 privateTON
const PRIVATE_START = START_TIMESTAMP;
const PRIVATE_CLIFF_DURATION_IN_SECONDS = 0;
const PRIVATE_FIRST_CLAIM_DURATION_IN_SECONDS = END_CLIFF_TIME.sub(PRIVATE_START); // 1599768000 - 1597201200  = 2566800
const PRIVATE_FIRST_CLAIM_AMOUNT = FIRST_PRIVATE_AMOUNT.div(SOURCE_RATIO); // 360000 / 50 = 7200
const PRIVATE_DURATION_UNIT = 10;

// 3.3.3 strategicTON
const STRATEGIC_START = START_TIMESTAMP;
const STRATEGIC_CLIFF_DURATION_IN_SECONDS = 0;
const STRATEGIC_FIRST_CLAIM_DURATION_IN_SECONDS = END_CLIFF_TIME.sub(STRATEGIC_START); // 1599768000 - 1597201200  = 2566800
const STRATEGIC_FIRST_CLAIM_AMOUNT = FIRST_STRATEGIC_AMOUNT.div(SOURCE_RATIO); // 378000 / 50 = 7560
const STRATEGIC_DURATION_UNIT = 10;

// 3.3.4 marketingTON
const MARKETING_START = END_CLIFF_TIME; // 2020. 9. 11 오전 5:00:00(KST)
const MARKETING_CLIFF_DURATION_IN_SECONDS = 0;
const MARKETING_FIRST_CLAIM_DURATION_IN_SECONDS = 0;
const MARKETING_FIRST_CLAIM_AMOUNT = 0;
const MARKETING_DURATION_UNIT = 10;

// amount to be minted

// 2,600,000 - (1515283.424251996524338723 + 20322.890490684333034588187841973) + @(?)
const GENERATED_MTON = new BN('1064393' + '685257319142626689'); // wei
const GENERATED_DAO_TON = new BN('350000' + '000000000000000000'); // wei
const GENERATED_TEAM_TON = new BN('150000' + '000000000000000000'); // wei
const GENERATED_ADVISOR_TON = new BN('30000' + '000000000000000000'); // wei
const GENERATED_BIZ_TON = new BN('100000' + '000000000000000000'); // wei
const GENERATED_RESERVE_TON = new BN('60000' + '000000000000000000'); // wei
const GENERATED_TON = new BN('50000000' + '000000000000000000'); // wei
const GENERATED_SEEDTON = new BN('30000' + '000000000000000000');
const GENERATED_PRIVATETON = new BN('144000' + '000000000000000000');
const GENERATED_STRATEGICTON = new BN('84000' + '000000000000000000');

// Vault approve amount

// VestingSwapperApproved = (STON + PTON + STTON)*50 + vestingMTON
// = (30000 + 144000 + 84000)*50 + 2399800
// = 15299800
const APPROVE_VESTING_SWAPPER = new BN('15299800' + '000000000000000000'); // wei

// SimpleSwapperApproved = TON.totalSupply - VestingSwapperApproved
// = 50000000 - 15299800
// = 34700200
const APPROVE_SIMPLE_SWAPPER = new BN('34700200' + '000000000000000000'); // wei

const data = {
  'seedTON': {
    'parameters': {
      'holder': HOLDER,
      'amount': GENERATED_SEEDTON,
    },
  },
  'privateTON': {
    'parameters': {
      'holder': HOLDER,
      'amount': GENERATED_PRIVATETON,
    },
  },
  'strategicTON': {
    'address': '',
    'parameters': {
      'holder': HOLDER,
      'amount': GENERATED_STRATEGICTON,
    },
  },
  'marketingTON': {
    'type': 'MTON.sol',
    'actions': [
      '.generateTokens(mtonHolder, generatedAmount)',
    ],
    'parameters': {
      'mtonHolder': MTON_HOLDER1,
      'generatedAmount': GENERATED_MTON, // wei
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
      'generatedAmount': GENERATED_DAO_TON, // Wei
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
      'generatedAmount': GENERATED_TEAM_TON, // Wei
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
      'generatedAmount': GENERATED_ADVISOR_TON, // Wei
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
        'tokenName': 'Business Tokamak Network Token',
        'decimalUnits': 18,
        'transferEnabled': true,
      },
      'businessTONHolder': BIZ_TON_HOLDER,
      'generatedAmount': GENERATED_BIZ_TON, // Wei
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
    'type': 'TON.sol deploy()',
    'actions': [
      'deploy.TON()',
    ],
    'parameters': {},
  },

  'simpleSwapper': {
    'type': 'Swapper.sol',
    'address': SIMPLE_SWAPPER,
    'actions': [
      'deploy simpleswapper(TONAddress, MTONAddress)',
      '.updateRatio(marketingTON, marketingRatio)',
      '.updateRatio(teamTON, teamRatio)',
      '.updateRatio(advisorTON, advisorRatio)',
      '.updateRatio(businessTON, businessRatio)',
      '.updateRatio(reserveTON, reserveRatio)',
      '.updateRatio(daoTON, daoRatio)',
      'TTON.initiate(start, cliffDuration, duration)',
      'ATON.initiate(start, cliffDuration, duration)',
      'BTON.initiate(start, cliffDuration, duration)',
      'RTON.initiate(start, cliffDuration, duration)',
      'DTON.initiate(start, cliffDuration, duration)',
      '.setStart(startTimeStamp)',
    ],
    'parameters': {
      'TONAddress': TON,
      'MTONAddress': MARKETING_TON,
      'valutAddress': TON_VAULT,
      'MTON': { // swap any amount, any time, setStart(startTimeStamp) is startTimeStamp of MTON
        'marketingTON': MARKETING_TON,
        'marketingRatio': MTON_RATIO,
      },
      'TeamTON': {
        'address': TEAM_TON,
        'teamRatio': SOURCE_RATIO,
        'start': TEAM_START,
        'cliffDurationInSeconds': CLIFF_DURATION_STEP_TOKEN,
        'duration': TEAM_DURATION,
      },
      'AdvisorTON': {
        'address': ADVISOR_TON,
        'advisorRatio': SOURCE_RATIO,
        'start': ADVISOR_START,
        'cliffDurationInSeconds': CLIFF_DURATION_STEP_TOKEN,
        'duration': ADVISOR_DURATON,
      },
      'BusinessTON': {
        'address': BUSINESS_TON,
        'businessRatio': SOURCE_RATIO,
        'start': BUSINNESS_START,
        'cliffDurationInSeconds': CLIFF_DURATION_STEP_TOKEN,
        'duration': BIZ_DURATION,
      },
      'ReserveTON': {
        'address': RESERVE_TON,
        'reserveRatio': SOURCE_RATIO,
        'start': RESERVE_START,
        'cliffDurationInSeconds': CLIFF_DURATION_STEP_TOKEN,
        'duration': RESERVE_DURATION,
      },
      'DaoTON': {
        'address': DAO_TON,
        'daoRatio': SOURCE_RATIO,
        'start': DAO_START,
        'cliffDurationInSeconds': CLIFF_DURATION_STEP_TOKEN,
        'duration': DAO_DURATION,
      },
      'startTimeStamp': START_TIMESTAMP,
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
      '.addUsingBurnerContract(SEED_TON)', //* ** TODO : should be imp in migration script ***
      '.addUsingBurnerContract(STRATEGIC_TON)', //* ** TODO : should be imp in migration script ***
      '.addUsingBurnerContract(MTON)', //* ** TODO : should be imp in migration script ***
    ],
    'TONAddress': TON,
    'MTONAddress': MARKETING_TON,
    'vaultAddress': TON_VAULT,
    'seedTON': {
      'address': SEED_TON,
      'seedRatio': SOURCE_RATIO,
      'start': SEED_START,
      'cliffDurationInSeconds': SEED_CLIFF_DURATION_IN_SECONDS,
      'firstClaimDurationInSeconds': SEED_FIRST_CLAIM_DURATION_IN_SECONDS,
      'firstClaimAmount': SEED_FIRST_CLAIM_AMOUNT,
      'durationUnit': SEED_DURATION_UNIT,
    },
    'privateTON': {
      'address': PRIVATE_TON,
      'privateRatio': SOURCE_RATIO,
      'start': PRIVATE_START,
      'cliffDurationInSeconds': PRIVATE_CLIFF_DURATION_IN_SECONDS,
      'firstClaimDurationInSeconds': PRIVATE_FIRST_CLAIM_DURATION_IN_SECONDS,
      'firstClaimAmount': PRIVATE_FIRST_CLAIM_AMOUNT,
      'durationUnit': PRIVATE_DURATION_UNIT,
    },
    'strategicTON': {
      'address': STRATEGIC_TON,
      'strategicRatio': SOURCE_RATIO,
      'start': STRATEGIC_START,
      'cliffDurationInSeconds': STRATEGIC_CLIFF_DURATION_IN_SECONDS,
      'firstClaimDurationInSeconds': STRATEGIC_FIRST_CLAIM_DURATION_IN_SECONDS,
      'firstClaimAmount': STRATEGIC_FIRST_CLAIM_AMOUNT,
      'durationUnit': STRATEGIC_DURATION_UNIT,
    },
    'marketingTON': {
      'address': MARKETING_TON,
      'marketingRatio': MTON_RATIO,
      'start': MARKETING_START,
      'cliffDurationInSeconds': MARKETING_CLIFF_DURATION_IN_SECONDS,
      'firstClaimDurationInSeconds': MARKETING_FIRST_CLAIM_DURATION_IN_SECONDS,
      'firstClaimAmount': MARKETING_FIRST_CLAIM_AMOUNT,
      'durationUnit': MARKETING_DURATION_UNIT,
    },
  },

  'vault': {
    'type': 'TONVault.sol',
    'actions': [
      'deploy.TONValut(TONAddress)',
      '.setApproveAmount(vestingSwapper, vestingSwapperAmount)',
      '.setApproveAmount(simpleSwapper, simpleSwapperAmount)',
      'SIMPLE_SWAPPER.setVault(valutAddress)',
      'VESTING_SWAPPER.setVault(valutAddress)',
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
      'amountToMint': GENERATED_TON, // wei
    },
  },

  // 9 tokens
  // 1 seigManager
  // 2 swapper
  // 1 valut
  'ownership': {
    'actions': [
      'SEED_TON.changeController(ZERO_ADDRESS)', // kevin's task
      'STRATEGIC_TON.changeController(ZERO_ADDRESS)', // kevin's task
      'MTON.changeController(SIMPLE_SWAPPER)', // kevin's task

      'seigManager.renounceOwner()', // kevin's task. Don't need in migration script

      'DAO_TON.changeController(SIMPLE_SWAPPER)', // simpleSwapper
      'TEAM_TON.changeController(SIMPLE_SWAPPER)', // simpleSwapper
      'ADVISOR_TON.changeController(SIMPLE_SWAPPER)', // simpleSwapper
      'BUSINESS_TON.changeController(SIMPLE_SWAPPER)', // simpleSwapper
      'RESERVE_TON.changeController(SIMPLE_SWAPPER)', // simpleSwapper

      'TON.transferOwnership(TONOwner)', // TON_OWNER
      'TON_VAULT.transferPrimary(ZERO_ONE_ADDRESS)', // zero-address

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
