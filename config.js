const { BN, constants, ether } = require('openzeppelin-test-helpers');
const presaleFirstClaimDurationInSeconds = new BN("14400"); // 60*60*4
const durationUnitInSeconds = 60*60*24*30;
const startTimestamp = 1596931200; // 8/9 9:00

const parameter ={
  'tonTotalSupply' : new BN('50000000000000000000000000'),
  "seed": {
    "totalSupply": new BN("30000000000000000000000"),
    "totalAllocationTon": new BN("1500000000000000000000000"),
    "ratio": new BN("50"),
    "startTimestamp": startTimestamp, 
    "cliffDurationInSeconds": 0,
    "firstClaimDurationInSeconds": presaleFirstClaimDurationInSeconds, 
    "firstClaimAmountInTon": new BN("15000000000000000000000"), 
    "durationInUnit": 6
  },
  "private": {
    "totalSupply": new BN("144000083230664748493368"),
    "totalAllocationTon": new BN("7200004161533237424668400"),
    "ratio": new BN("50"),
    "startTimestamp": startTimestamp, 
    "cliffDurationInSeconds": 0,
    "firstClaimDurationInSeconds": presaleFirstClaimDurationInSeconds, 
    "firstClaimAmountInTon": new BN("360000000000000000000000"), 
    "durationInUnit": 10
  },
  "strategic": {
    "totalSupply": new BN("84000100000000000000000"),
    "totalAllocationTon": new BN("4200005000000000000000000"),
    "ratio": new BN("50"),
    "startTimestamp": startTimestamp, 
    "cliffDurationInSeconds": 0,
    "firstClaimDurationInSeconds": presaleFirstClaimDurationInSeconds, 
    "firstClaimAmountInTon": new BN("378000000000000000000000"), 
    "durationInUnit": 10
  },
  "mton": {
    "totalSupply": new BN("1501834361269942226382433"),
    "totalAllocationTon": new BN("2600005000000000000000000"),
    "ratio": new BN("1"),
    "startTimestamp": startTimestamp, 
    "cliffDurationInSeconds": 0,
    "firstClaimDurationInSeconds": presaleFirstClaimDurationInSeconds, 
    "firstClaimAmountInTon": new BN("234000000000000000000000"), 
    "durationInUnit": 10
  },
  "team": {
    "totalSupply": new BN("150000000000000000000000"),
    "totalAllocationTon": new BN("7500000000000000000000000"),
    "ratio": new BN("50"),
    "startTimestamp": startTimestamp, 
    "cliffDurationInSeconds": 0,
    "cliffDurationInUnit": new BN("5"),
    "firstClaimDurationInSeconds": new BN("0"), 
    "firstClaimAmountInTon": new BN("0"),
    "durationInUnit": 36
  },
  "advisor": {
    "totalSupply": new BN("30000000000000000000000"),
    "totalAllocationTon": new BN("1500000000000000000000000"),
    "ratio": new BN("50"),
    "startTimestamp": startTimestamp, 
    "cliffDurationInSeconds": 0,
    "cliffDurationInUnit": new BN("5"),
    "firstClaimDurationInSeconds": new BN("0"), 
    "firstClaimAmountInTon": new BN("0"),
    "durationInUnit": 18
  },
  "business": {
    "totalSupply": new BN("100000000000000000000000"),
    "totalAllocationTon": new BN("5000000000000000000000000"),
    "ratio": new BN("50"),
    "startTimestamp": startTimestamp, 
    "cliffDurationInSeconds": 0,
    "cliffDurationInUnit": new BN("1"),
    "firstClaimDurationInSeconds": new BN("0"), 
    "firstClaimAmountInTon": new BN("0"),
    "durationInUnit": 30
  },
  "reserve": {
    "totalSupply": new BN("6000000000000000000000"),
    "totalAllocationTon": new BN("300000000000000000000000"),
    "ratio": new BN("50"),
    "startTimestamp": startTimestamp, 
    "cliffDurationInSeconds": 0,
    "cliffDurationInUnit": new BN("11"),
    "firstClaimDurationInSeconds": new BN("0"), 
    "firstClaimAmountInTon": new BN("0"),
    "durationInUnit": 36
  },
  "dao": {
    "totalSupply": new BN("350000000000000000000000"),
    "totalAllocationTon": new BN("17500000000000000000000000"),
    "ratio": new BN("50"),
    "startTimestamp": startTimestamp, 
    "cliffDurationInSeconds": 0,
    "cliffDurationInUnit": new BN("5"),
    "firstClaimDurationInSeconds": new BN("0"), 
    "firstClaimAmountInTon": new BN("0"),
    "durationInUnit": 0
  },
}

module.exports = parameter;