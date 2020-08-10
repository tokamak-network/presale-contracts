
//Accounts Address
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

//// Contract Address ////
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
      "MTON.initiate(MTONstart, MTONcliffDuration, MTONduration)",
      ".updateRatio(teamTON, teamRatio)",
      "TeamTON.initiate(teamTON, teamTONstart, teamTONcliffDurationInSeconds, teamTONfirstClaimDurationInSeconds, teamTONfirstClaimAmount, teamTONdurationUnit)",
      ".updateRatio(advisorTON, advisorRatio)",
      "ATON.initiate(ATON, ATONstart, ATONcliffDurationInSeconds, ATONfirstClaimDurationInSeconds, ATONfirstClaimAmount, ATONdurationUnit)",
      ".updateRatio(businessTON, businessRatio)",
      "BTON.initiate(BTON, BTONstart, BTONcliffDurationInSeconds, BTONfirstClaimDurationInSeconds, BTONfirstClaimAmount, BTONdurationUnit)",
      ".updateRatio(reserveTON, reserveRatio)",
      "RTON.initiate(RTON, RTONstart, RTONcliffDurationInSeconds, RTONfirstClaimDurationInSeconds, RTONfirstClaimAmount, RTONdurationUnit)",
      ".updateRatio(daoTON, daoRatio)",
      "DTON.initiate(DTON, DTONstart, DTONcliffDurationInSeconds, DTONfirstClaimDurationInSeconds, DTONfirstClaimAmount, DTONdurationUnit)",
      ".setStart(startTimestamp)",
      ".changeController(newOwner)"
    ]
  },

  "vestingSwapper" : {
    "actions" : [
      "deploy vestingSwapper(TONAddress, MTONAddress)",
      ".setVault(vaultAddress)",
      ".setBurner(bernerAddress)",
      ".initiate(seedTON, seedTONstart, seedTONcliffDurationInSeconds, seedTONfirstClaimDurationInSeconds, seedTONfirstClaimAmount, seedTONdurationUnit)",
      ".initiate(PTON, PTONstart, PTONcliffDurationInSeconds, PTONfirstClaimDurationInSeconds, PTONfirstClaimAmount, PTONdurationUnit)",
      ".initiate(StTON, StTONstart, StTONcliffDurationInSeconds, StTONfirstClaimDurationInSeconds, StTONfirstClaimAmount, StTONdurationUnit)",
      ".initiate(MTON, MTONstart, MTONcliffDurationInSeconds, MTONfirstClaimDurationInSeconds, MTONfirstClaimAmount, MTONdurationUnit)",
      ".updateRatio(seedTON, seedRatio)",
      ".updateRatio(privateTON, seedRatio)",
      ".updateRatio(strategicTON, strategicRatio)",
      ".updateRatio(marketingTON, marketingRatio)",
      ".transferPrimary(zero-one-address)"
    ]
  }
};


module.exports = data;
