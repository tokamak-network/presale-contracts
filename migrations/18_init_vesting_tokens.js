const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;
const Web3 = require('web3');
const { networks } = require('../truffle-config.js');

const VestingToken = artifacts.require('VestingToken');
const VestingTokenStep = artifacts.require('VestingTokenStep');
const TON = artifacts.require('TON');
const parameter = require('../config.js');
const param = require('./variables.js');

const VestingSwapper = artifacts.require('VestingSwapper');
const SimpleSwapper = artifacts.require('Swapper');
const Vault = artifacts.require('TONVault');
const Burner = artifacts.require('Burner');

const fs = require('fs');

async function setSwapperStart (swapper, start) {
  const startInContract = await swapper.startTimestamp;
  if (startInContract !== start) {
    await swapper.setStart(start);
  }
}

module.exports = async function (deployer) {
  let data, vestingSwapper, simpleSwapper, burner;

  if (
    process.env.SEEDINIT ||
    process.env.PRIVATEINIT ||
    process.env.STRATEGICINIT ||
    process.env.MARKETINGINIT ||
    process.env.TEAMINIT ||
    process.env.ADVISORINIT ||
    process.env.BUSINESSINIT ||
    process.env.RESERVEINIT ||
    process.env.DAOINIT ||
    process.env.SETVAULTSIMPLE ||
    process.env.SETVAULTVESTING
  ) {
    data = JSON.parse(fs.readFileSync('deployed.json').toString());

    vestingSwapper = await VestingSwapper.at(param.vestingSwapper.address);
    simpleSwapper = await SimpleSwapper.at(param.simpleSwapper.SimpleSwapper);
    // burner = await Burner.at(data.Burner);
  }
  const vesting = param.vestingSwapper;
  // const start = (Date.now() / 1000 | 0) + 10;
  if (process.env.SEEDINIT) {
    const SeedTON = await VestingToken.at(
      vesting.seedTON.SeedTON
    );

    await vestingSwapper.updateRatio(
      vesting.seedTON.SeedTON,
      vesting.seedTON.seedRatio
    );
    // token, start, cliff, first claim duration, first claim amount, duration
    await vestingSwapper.initiate(
      vesting.seedTON.SeedTON,
      vesting.seedTON.start,
      vesting.seedTON.cliffDurationInSeconds,
      vesting.seedTON.firstClaimDurationInSeconds,
      vesting.seedTON.firstClaimAmount,
      vesting.seedTON.durationUnit
    );

    await SeedTON.changeController(param.ownership.parameters.ZERO_ADDRESS);
  }
  if (process.env.PRIVATEINIT) {
    const PrivateTON = await VestingToken.at(
      vesting.privateTON.PrivateTON
    );
    await vestingSwapper.updateRatio(
      vesting.privateTON.PrivateTON,
      vesting.privateTON.privateRatio
    );
    await vestingSwapper.initiate(
      vesting.privateTON.PrivateTON,
      vesting.privateTON.start,
      vesting.privateTON.cliffDurationInSeconds,
      vesting.privateTON.firstClaimDurationInSeconds,
      vesting.privateTON.firstClaimAmount,
      vesting.privateTON.durationUnit
    );

    // await PrivateTON.changeController(param.ownership.parameters.ZERO_ADDRESS);
  }
  if (process.env.STRATEGICINIT) {
    const StrategicTON = await VestingToken.at(
      vesting.strategicTON.StrategicTON
    );
    await vestingSwapper.updateRatio(
      vesting.strategicTON.StrategicTON,
      vesting.strategicTON.strategicRatio
    );
    await vestingSwapper.initiate(
      vesting.strategicTON.StrategicTON,
      vesting.strategicTON.start,
      vesting.strategicTON.cliffDurationInSeconds,
      vesting.strategicTON.firstClaimDurationInSeconds,
      vesting.strategicTON.firstClaimAmount,
      vesting.strategicTON.durationUnit
    );

    await StrategicTON.changeController(param.ownership.parameters.ZERO_ADDRESS);
  }
  if (process.env.MARKETINGINIT) {
    const MarketingTON = await VestingToken.at(
      vesting.marketingTON.MarketingTON
    );
    await simpleSwapper.updateRatio(
      vesting.marketingTON.MarketingTON,
      vesting.marketingTON.marketingRatio
    );
    await vestingSwapper.updateRatio(
      vesting.marketingTON.MarketingTON,
      vesting.marketingTON.marketingRatio
    );
    await vestingSwapper.initiate(
      vesting.marketingTON.MarketingTON,
      vesting.marketingTON.start,
      vesting.marketingTON.cliffDurationInSeconds,
      vesting.marketingTON.firstClaimDurationInSeconds,
      vesting.marketingTON.firstClaimAmount,
      vesting.marketingTON.durationInUnit
    );
    MarketingTON.changeController(param.simpleSwapper.address);
  }
  const simple = param.simpleSwapper.parameters;
  if (process.env.TEAMINIT) {
    const TeamTON = await VestingTokenStep.at(
      simple.TeamTON.teamTON
    );
    await simpleSwapper.updateRatio(
      simple.TeamTON.teamTON,
      simple.TeamTON.teamRatio
    );
    await TeamTON.initiate(
      simple.TeamTON.start,
      simple.TeamTON.cliffDurationInSeconds,
      simple.TeamTON.durtation
    );

    await TeamTON.changeController(param.simpleSwapper.address);
  }
  if (process.env.ADVISORINIT) {
    const AdvisorTON = await VestingTokenStep.at(
      simple.AdvisorTON.advisorTON
    );
    await simpleSwapper.updateRatio(
      simple.AdvisorTON.advisorTON,
      simple.AdvisorTON.advisorRatio
    );
    await AdvisorTON.initiate(
      simple.AdvisorTON.start,
      simple.AdvisorTON.cliffDurationInSeconds,
      simple.AdvisorTON.durtation
    );

    await AdvisorTON.changeController(param.simpleSwapper.address);
  }
  if (process.env.BUSINESSINIT) {
    const BusinessTON = await VestingTokenStep.at(
      simple.BusinessTON.businessTON
    );
    await simpleSwapper.updateRatio(
      simple.BusinessTON.businessTON,
      simple.BusinessTON.businessRatio
    );
    await BusinessTON.initiate(
      simple.BusinessTON.start,
      simple.BusinessTON.cliffDurationInSeconds,
      simple.BusinessTON.durtation
    );

    await BusinessTON.changeController(param.simpleSwapper.address);
  }
  if (process.env.RESERVEINIT) {
    const ReserveTON = await VestingTokenStep.at(
      simple.ReseverTON.reserveTON
    );
    await simpleSwapper.updateRatio(
      simple.ReseverTON.reserveTON,
      simple.ReseverTON.reserveRatio
    );
    await ReserveTON.initiate(
      simple.ReserveTON.start,
      simple.ReserveTON.cliffDurationInSeconds,
      simple.ReserveTON.durtation
    );

    await ReserveTON.changeController(param.simpleSwapper.address);
  }
  if (process.env.DAOINIT) {
    const daoTON = await VestingTokenStep.at(
      simple.DaoTON.daoTON
    );
    await simpleSwapper.updateRatio(
      simple.DaoTON.daoTON,
      simple.DaoTON.daoRatio
    );
    await daoTON.initiate(
      simple.DaoTON.start,
      simple.DaoTON.cliffDurationInSeconds,
      simple.DaoTON.durtation
    );

    await daoTON.changeController(param.simpleSwapper.address);
  }
  if (process.env.SETVAULT) {
    await simpleSwapper.setVault(param.simpleSwapper.parameter.TONVault);
    await vestingSwapper.setVault(param.simpleSwapper.parameter.TONVault);
    // await simpleSwapper.setBurner(data.Burner);
    await simpleSwapper.changeController(param.ownership.parameters.ZERO_ADDRESS);
    await Vault.transferPrimary(param.ownership.parameters.ZERO_ONE_ADDRESS);
    await vestingSwapper.transferPrimary(param.ownership.parameters.ZERO_ONE_ADDRESS);
  }
  // if (process.env.SETVAULTVESTING) {

  //   // await vestingSwapper.setBurner(data.Burner);
  // }
  if (process.env.SETSWAPPER) {
    setSwapperStart(vestingSwapper, param.vestingSwapper.startTimestamp);
    setSwapperStart(simpleSwapper, param.simpleSwapper.startTimestamp);
  }
  // if (process.env.TRANSFER) {
  //   const SeedTON = await VestingToken.at(data.SeedTON);
  //   await SeedTON.transferOwnership();
  // }
};
