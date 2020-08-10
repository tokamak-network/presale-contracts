
//// 1.Accounts Address ////
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_ONE_ADDRESS = "0x0000000000000000000000000000000000000001";
const TeamTONHolder = "0xB2E518b841b0Cb7124dDaDcbb882BbCED4337cBf";
const BizTONHolder = "0x36f917BBd70d31F0501fCe2Cd1756A977d783E44";
const DaoTONHolder = "0x6d6231121807cEaE402F355B76eEbCCb7EA21806";
const MarketingTONHolder1 = "0x32e95D328A6bD3D0966b34026b929833015e70C2";
const MarketingTONHolder2 = "0x340C44089bc45F86060922d2d89eFee9e0CDF5c7";
const ReserveTONHolder = "0x2Db13E39eaf889A433E0CB23C38520419eC37202";
const AdvisorTONHolder = "0x33c0e0cf845502EDa9873E8Ab1Da1DaF5a47eac6";
const TONVaultOwner = "0xBB6b2fCCC6AA3518FBE36F739A7dE048e814998A";
const TONOwner = "0xC8F4035b79cB95fA18F9BAa9C457843954C28233";
const SIMPLE_SWAPPER_OWNER = ""; // Can be zero-address
const VESTING_SWAPPER_OWNER= ""; // Can be zero-address

//// 2.Contract Addresses ////
//vestingToken, have to use vestingSwapper(Don't have to init token itself).
const SEED_TON = "0x8Ae43F11DDd3fac5bbD84ab0BA795E1e51b78df7";
const PRIVATE_TON = "0x2C0F8e85ad3DCbEc1561f6cE632DFF86294e479f";
const STRATEGIC_TON = "0x2801265c6f888f5a9e1b72ee175fc0091e007080";
//vestingTokenStep, use simpleSwapper(It should be inited itself).
const MARKETING_TON = "";
const DAO_TON = "";
const TEAM_TON = "";
const ADVISOR_TON = "";
const BUSINESS_TON = "";
const RESERVE_TON = "";
const TON = "";
const TON_VAULT = "";
const BURNER = "";
const SIMPLE_SWAPPER = "";
const VESTING_SWAPPER = "";
//seigManager contract
const SEIG_MANAGER = "0x2104cEC955b6FaBF603d8B2Ee0c28EA88886fa8C";

//// 3.Swaps and Vestings ////
//3.1Swap ratios
const MTON_RATIO = 1;
const SOURCE_RATIO = 50;
//3.2Vesting timestamp related
const START_TIMESTAMP = ""
const DURATON = "" //30 days
const CLIFF_DURATION_STEP_TOKEN = ""
//3.3Vesting swapper related
//3.3.1seedTON
const SEED_START = ""
const SEED_CLIFF_DURATION_IN_SECONDS = ""
const SEED_FIRST_CLAIM_DURATION_IN_SECONDS = ""
const SEED_FIRST_CLAIM_AMOUNT = ""
const SEED_DURATION_UNIT = ""
//3.3.2privateTON
const PRIVATE_START = ""
const PRIVATE_CLIFF_DURATION_IN_SECONDS = ""
const PRIVATE_FIRST_CLAIM_DURATION_IN_SECONDS = ""
const PRIVATE_FIRST_CLAIM_AMOUNT = ""
const PRIVATE_DURATION_UNIT = ""
//3.3.3strategicTON
const STRATEGIC_START = ""
const STRATEGIC_CLIFF_DURATION_IN_SECONDS = ""
const STRATEGIC_FIRST_CLAIM_DURATION_IN_SECONDS = ""
const STRATEGIC_FIRST_CLAIM_AMOUNT = ""
const STRATEGIC_DURATION_UNIT = ""
//3.3.4marketingTON
const MARKETING_START = ""
const MARKETING_CLIFF_DURATION_IN_SECONDS = ""
const MARKETING_FIRST_CLAIM_DURATION_IN_SECONDS = ""
const MARKETING_FIRST_CLAIM_AMOUNT = ""
const MARKETING_DURATION_UNIT = ""


const data = {
  "seedTON" : {
    "actions" : [
      "SEED_TON.changeController(newOwner)"
    ],
    "deployedAddress" : SEED_TON,
    "newOwner" : ZERO_ADDRESS
  },

  "privateTON" : {
    "actions" : [],
    "deployedAddress" : PRIVATE_TON
  },

  "strategicTON" : {
    "actions" : [
      ".changeController(newOwner)"
    ],
    "deployedAddress" : STRATEGIC_TON,
    "newOwner" : ZERO_ADDRESS
  },

  "marketingTON" : {
    "actions": [
      ".generateTokens(mtonHolder,generatedAmount)",
      ".changeController(newOwner)",
      "seigManager.renounceOwner()"
    ],
    "mtonHolder" : MarketingTONHolder1,
    "generatedAmount" : "", //not wei
    "newOwner" : ZERO_ADDRESS,
    "deployedSeigManager" : SEIG_MANAGER
  },

  "daoTON" : {
    "actions" : [
      "deploy daoTON(tokenFactory, parentToken, parentSnapShotBlock, tokenName, decimalUnits, tokenSymbol, transfersEnabled)",
      ".generateTokens(daoTONHolder, generatedAmount)",
      ".initiate(start, cliffDuration, duration)",
      '.changeController(newOwner)'
    ],
    "constructor" : {
      "tokenFactory" : ZERO_ADDRESS,
      "parentToken" : ZERO_ADDRESS,
      "parentSnapShotBlock" : 0,
      "tokenName" : "DAO Tokamak Network Token",
      "decimalUnits" : 18,
      "transferEnabled" : true,
    },
    "daoTONHolder" : DaoTONHolder,
    "generatedAmount" : "350000" , //Not Wei
    "initiate" : {
      "start" : "",
      "cliffDuration" : "",
      "duration" : ""
    },
    "newOwner" : ""
  },

  "teamTON" : {
    "actions" : [
      "deploy teamTON(tokenFactory, parentToken, parentSnapShotBlock, tokenName, decimalUnits, tokenSymbol, transfersEnabled)",
      ".generateTokens(teamTONHolder, generatedAmount)",
      ".initiate(start, cliffDuration, duration)",
      '.changeController(newOwner)'
    ],
    "constructor" : {
      "tokenFactory" : ZERO_ADDRESS,
      "parentToken" : ZERO_ADDRESS,
      "parentSnapShotBlock" : 0,
      "tokenName" : "Team Tokamak Network Token",
      "decimalUnits" : 18,
      "transferEnabled" : true,
    },
    "teamTONHolder" : TeamTONHolder,
    "generatedAmount" : "150000", //Not Wei
    "initiate" : {
      "start" : "",
      "cliffDuration" : "",
      "duration" : ""
    },
    "newOwner" : ZERO_ADDRESS
  },

  "advisorTON" : {
    "actions" : [
      "deploy advisorTON(tokenFactory, parentToken, parentSnapShotBlock, tokenName, decimalUnits, tokenSymbol, transfersEnabled)",
      ".generateTokens(advisorTONHolder, generatedAmount)",
      ".initiate(start, cliffDuration, duration)",
      '.changeController(newOwner)'
    ],
    "constructor" : {
      "tokenFactory" : ZERO_ADDRESS,
      "parentToken" : ZERO_ADDRESS,
      "parentSnapShotBlock" : 0,
      "tokenName" : "Advisor Tokamak Network Token",
      "decimalUnits" : 18,
      "transferEnabled" : true,
    },
    "advisorTONHolder" : AdvisorTONHolder
    "generatedAmount" : "", //Not Wei
    "initiate" : {
      "start" : "",
      "cliffDuration" : "",
      "duration" : ""
    },
    "newOwner" : ZERO_ADDRESS
  },

  "businessTON" : {
    "actions" : [
      "deploy businessTON(tokenFactory, parentToken, parentSnapShotBlock, tokenName, decimalUnits, tokenSymbol, transfersEnabled)",
      ".generateTokens(bisinessTONHolder, generatedAmount)",
      ".initiate(start, cliffDuration, duration)",
      '.changeController(newOwner)'
    ],
    "constructor" : {
      "tokenFactory" : ZERO_ADDRESS,
      "parentToken" : ZERO_ADDRESS,
      "parentSnapShotBlock" : 0,
      "tokenName" : "business Tokamak Network Token",
      "decimalUnits" : 18,
      "transferEnabled" : true,
    },
    "bisinessTONHolder" : BizTONHolder
    "generatedAmount" : "", //Not Wei
    "initiate" : {
      "start" : "",
      "cliffDuration" : "",
      "duration" : ""
    },
    "newOwner" : ZERO_ADDRESS
  },

  "reserveTON" : {
    "actions" : [
      "deploy reserveTON(tokenFactory, parentToken, parentSnapShotBlock, tokenName, decimalUnits, tokenSymbol, transfersEnabled)",
      ".generateTokens(reserveTONHolder, generatedAmount)",
      ".initiate(start, cliffDuration, duration)",
      '.changeController(newOwner)'
    ],
    "constructor" : {
      "tokenFactory" : ZERO_ADDRESS,
      "parentToken" : ZERO_ADDRESS,
      "parentSnapShotBlock" : 0,
      "tokenName" : "Reserve Tokamak Network Token",
      "decimalUnits" : 18,
      "transferEnabled" : true,
    },
    "reserveTONHolder" : ReserveTONHolder
    "generatedAmount" : "", //Not Wei
    "initiate" : {
      "start" : "",
      "cliffDuration" : "",
      "duration" : ""
    },
    "newOwner" : ZERO_ADDRESS
  },,

  "ton": {
    "actions" : [
      "deploy.TON()",
      ".mint(tonVaultAddress, amountToMint)",
      ".transferOwnership(TONOwner)"
    ],
    "tonVaultAddress" : "",
    "amountToMint" : "50000000", //not wei, ether
    "TONOwner" : TONOwner
  },

  "valut": {
    "actions" : [
      "deploy.TONValut(TONAddress)",
      ".setApproveAmount(vestingSwapper, vestingSwapperAmount)",
      ".setApproveAmount(simpleSwapper, simpleSwapperAmount)",
      ".transferPrimary(vaultOwner)"
    ],
    "TONAddress" : TON,
    "vestingSwapper" : VESTING_SWAPPER,
    "vestingSwapperAmount" : "",
    "simpleSwapper" : SIMPLE_SWAPPER,
    "vaultOwner" : TONVaultOwner
  },

  "burner" : {
    "actions" : [
      "deploy.burner"
    ]
  },

  "simpleSwapper" : {
    "actions" : [
      "deploy simpleswapper(TONAddress, MTONAddress)",
      ".setVault(valutAddress)",
      ".setBurner(burnerAddress)",
      ".updateRatio(marketingTON, marketingRatio)",
      ".updateRatio(teamTON, teamRatio)",
      ".updateRatio(advisorTON, advisorRatio)",
      ".updateRatio(businessTON, businessRatio)",
      ".updateRatio(reserveTON, reserveRatio)",
      ".updateRatio(daoTON, daoRatio)",
      "MTON.initiate(start, cliffDuration, duration)",
      "TTON.initiate(start, cliffDuration, duration)",
      "ATON.initiate(start, cliffDuration, duration)",
      "BTON.initiate(start, cliffDuration, duration)",
      "RTON.initiate(start, cliffDuration, duration)",
      "DTON.initiate(start, cliffDuration, duration)",
      ".changeController(newOwner)"
    ],
    "TONAddress" : TON,
    "MTONAddress" : MARKETING_TON,
    "valutAddress" : TON_VAULT,
    "burnerAddress" : BURNER,
    "MTON" : {
      "marketingTON" : MARKETING_TON,
      "marketingRatio" : MTON_RATIO,
      "start": START_TIMESTAMP,
      "cliffDuration" : CLIFF_DURATION_STEP_TOKEN,
      "duration": DURATON,
    },
    "TeamTON" : {
      "teamTON" : TEAM_TON,
      "teamRatio" : SOURCE_RATIO,
      "start": START_TIMESTAMP,
      "cliffDurationInSeconds" : CLIFF_DURATION_STEP_TOKEN,
      "duration": DURATON,
    },
    "AdvisorTON" : {
      "advisorTON" : TEAM_TON,
      "advisorRatio" : SOURCE_RATIO,
      "start": START_TIMESTAMP,
      "cliffDurationInSeconds" : CLIFF_DURATION_STEP_TOKEN,
      "duration": DURATON,
    },
    "BusinessTON" : {
      "BusinessTON" : TEAM_TON,
      "BusinessRatio" : SOURCE_RATIO,
      "start": START_TIMESTAMP,
      "cliffDurationInSeconds" : CLIFF_DURATION_STEP_TOKEN,
      "duration": DURATON,
    },
    "reserveTON" : {
      "reserveTON" : TEAM_TON,
      "reserveRatio" : SOURCE_RATIO,
      "start": START_TIMESTAMP,
      "cliffDurationInSeconds" : CLIFF_DURATION_STEP_TOKEN,
      "duration": DURATON,
    },
    "daoTON" : {
      "daoTON" : TEAM_TON,
      "daoRatio" : SOURCE_RATIO,
      "start": START_TIMESTAMP,
      "cliffDurationInSeconds" : CLIFF_DURATION_STEP_TOKEN,
      "duration": DURATON,
    },
    "newOwner" : SIMPLE_SWAPPER_OWNER
  },

  "vestingSwapper" : {
    "actions" : [
      "deploy vestingSwapper(TONAddress, MTONAddress)",
      ".setVault(vaultAddress)",
      ".setBurner(burnerAddress)",
      ".initiate(seedTON, start, cliffDurationInSeconds, firstClaimDurationInSeconds, firstClaimAmount, durationUnit)",
      ".initiate(privateTON, start, PcliffDurationInSeconds, firstClaimDurationInSeconds, firstClaimAmount, durationUnit)",
      ".initiate(strategicTON, start, cliffDurationInSeconds, firstClaimDurationInSeconds, firstClaimAmount, durationUnit)",
      ".initiate(marketingTON, start, cliffDurationInSeconds, firstClaimDurationInSeconds, firstClaimAmount, durationUnit)",
      ".updateRatio(seedTON, seedRatio)",
      ".updateRatio(privateTON, seedRatio)",
      ".updateRatio(strategicTON, strategicRatio)",
      ".updateRatio(marketingTON, marketingRatio)",
      ".setStart(startTimestamp)",
      ".transferPrimary(zero-one-address)"
    ],
    "TONAddress" : TON,
    "MTONAddress" : MARKETING_TON,
    "vaultAddress" : TON_VAULT,
    "burnerAddress" : BURNER,
    "seedTON" : {
      "seedTON" : SEED_TON,
      "seedRatio" : SOURCE_RATIO,
      "start" : SEED_START,
      "cliffDurationInSeconds" : SEED_CLIFF_DURATION_IN_SECONDS,
      "firstClaimDurationInSeconds" : SEED_FIRST_CLAIM_DURATION_IN_SECONDS,
      "firstClaimAmount" : SEED_FIRST_CLAIM_AMOUNT,
      "durationUnit" : SEED_DURATION_UNIT,
    },
    "privateTON" : {
      "privateTON" : PRIVATE_TON,
      "privateRatio" : SOURCE_RATIO,
      "start" : PRIVATE_START,
      "cliffDurationInSeconds" : PRIVATE_CLIFF_DURATION_IN_SECONDS,
      "firstClaimDurationInSeconds" : PRIVATE_FIRST_CLAIM_DURATION_IN_SECONDS,
      "firstClaimAmount" : PRIVATE_FIRST_CLAIM_AMOUNT,
      "durationUnit" : PRIVATE_DURATION_UNIT,
    },
    "strategicTON" : {
      "strategicTON" : STRATEGIC_TON,
      "strategicRatio" : SOURCE_RATIO,
      "start" : STRATEGIC_START,
      "cliffDurationInSeconds" : STRATEGIC_CLIFF_DURATION_IN_SECONDS,
      "firstClaimDurationInSeconds" : STRATEGIC_FIRST_CLAIM_DURATION_IN_SECONDS,
      "firstClaimAmount" : STRATEGIC_FIRST_CLAIM_AMOUNT,
      "durationUnit" : STRATEGIC_DURATION_UNIT,
    },
    "marketingTON" : {
      "marketingTON" : MARKETING_TON,
      "marketingRatio" : SOURCE_RATIO,
      "start" : MARKETING_START,
      "cliffDurationInSeconds" : MARKETING_CLIFF_DURATION_IN_SECONDS,
      "firstClaimDurationInSeconds" : MARKETING_FIRST_CLAIM_DURATION_IN_SECONDS,
      "firstClaimAmount" : MARKETING_FIRST_CLAIM_AMOUNT,
      "durationUnit" : MARKETING_DURATION_UNIT,
    },
  }
};


module.exports = data;
