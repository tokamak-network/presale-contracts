const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;
const Web3 = require('web3');
const { networks } = require('../truffle-config.js');

const VestingToken = artifacts.require('VestingToken');
const VestingTokenStep = artifacts.require('VestingTokenStep');
const Ton = artifacts.require('TON');
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
  let vesting, vestingSwapper, simpleSwapper, SeedTON, PrivateTON, StrategicTON, MarketingTON, daoTON;
  let TeamTON, ReserveTON, AdvisorTON, BusinessTON, simple;
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
    vesting = param.vestingSwapper;
    simple = param.simpleSwapper.parameters;

    vestingSwapper = await VestingSwapper.at(param.vestingSwapper.address);
    simpleSwapper = await SimpleSwapper.at(param.simpleSwapper.address);

    SeedTON = await VestingToken.at(vesting.seedTON.address);
    PrivateTON = await VestingToken.at(vesting.privateTON.address);
    StrategicTON = await VestingToken.at(vesting.strategicTON.address);
    MarketingTON = await VestingToken.at(vesting.marketingTON.address);
    daoTON = await VestingTokenStep.at(simple.DaoTON.address);
    TeamTON = await VestingTokenStep.at(simple.TeamTON.address);
    ReserveTON = await VestingTokenStep.at(simple.ReserveTON.address);
    AdvisorTON = await VestingTokenStep.at(simple.AdvisorTON.address);
    BusinessTON = await VestingTokenStep.at(simple.BusinessTON.address);

    // TON = await TON.at(simple.TONAddress);
  }

  if (process.env.SEEDINIT) {
    await vestingSwapper.updateRatio(
      vesting.seedTON.address,
      vesting.seedTON.seedRatio
    );
    // token, start, cliff, first claim duration, first claim amount, duration
    await vestingSwapper.initiate(
      vesting.seedTON.address,
      vesting.seedTON.start,
      vesting.seedTON.cliffDurationInSeconds,
      vesting.seedTON.firstClaimDurationInSeconds,
      vesting.seedTON.firstClaimAmount,
      vesting.seedTON.durationUnit
    );

    // await SeedTON.changeController(param.ownership.parameters.ZERO_ADDRESS);
  }
  if (process.env.PRIVATEINIT) {
    await vestingSwapper.updateRatio(
      vesting.privateTON.address,
      vesting.privateTON.privateRatio
    );
    await vestingSwapper.initiate(
      vesting.privateTON.address,
      vesting.privateTON.start,
      vesting.privateTON.cliffDurationInSeconds,
      vesting.privateTON.firstClaimDurationInSeconds,
      vesting.privateTON.firstClaimAmount,
      vesting.privateTON.durationUnit
    );
  }
  if (process.env.STRATEGICINIT) {
    await vestingSwapper.updateRatio(
      vesting.strategicTON.address,
      vesting.strategicTON.strategicRatio
    );
    await vestingSwapper.initiate(
      vesting.strategicTON.address,
      vesting.strategicTON.start,
      vesting.strategicTON.cliffDurationInSeconds,
      vesting.strategicTON.firstClaimDurationInSeconds,
      vesting.strategicTON.firstClaimAmount,
      vesting.strategicTON.durationUnit
    );

    // await StrategicTON.changeController(param.ownership.parameters.ZERO_ADDRESS);
  }
  if (process.env.MARKETINGINIT) {
    await simpleSwapper.updateRatio(
      vesting.marketingTON.address,
      vesting.marketingTON.marketingRatio
    );
    await vestingSwapper.updateRatio(
      vesting.marketingTON.address,
      vesting.marketingTON.marketingRatio
    );
    await vestingSwapper.initiate(
      vesting.marketingTON.address,
      vesting.marketingTON.start,
      vesting.marketingTON.cliffDurationInSeconds,
      vesting.marketingTON.firstClaimDurationInSeconds,
      vesting.marketingTON.firstClaimAmount,
      vesting.marketingTON.durationUnit
    );

    // await MarketingTON.changeController(param.simpleSwapper.address);
  }
  if (process.env.TEAMINIT) {
    await simpleSwapper.updateRatio(
      simple.TeamTON.address,
      simple.TeamTON.teamRatio
    );
    await TeamTON.initiate(
      simple.TeamTON.start,
      simple.TeamTON.cliffDurationInSeconds,
      simple.TeamTON.duration
    );
  }
  if (process.env.ADVISORINIT) {
    await simpleSwapper.updateRatio(
      simple.AdvisorTON.address,
      simple.AdvisorTON.advisorRatio
    );
    await AdvisorTON.initiate(
      simple.AdvisorTON.start,
      simple.AdvisorTON.cliffDurationInSeconds,
      simple.AdvisorTON.durtation
    );
  }
  if (process.env.BUSINESSINIT) {
    await simpleSwapper.updateRatio(
      simple.BusinessTON.address,
      simple.BusinessTON.businessRatio
    );
    await BusinessTON.initiate(
      simple.BusinessTON.start,
      simple.BusinessTON.cliffDurationInSeconds,
      simple.BusinessTON.durtation
    );
  }
  if (process.env.RESERVEINIT) {
    await simpleSwapper.updateRatio(
      simple.ReseveTON.address,
      simple.ReseveTON.reserveRatio
    );
    await ReserveTON.initiate(
      simple.ReserveTON.start,
      simple.ReserveTON.cliffDurationInSeconds,
      simple.ReserveTON.durtation
    );
  }
  if (process.env.DAOINIT) {
    await simpleSwapper.updateRatio(
      simple.DaoTON.address,
      simple.DaoTON.daoRatio
    );
    await daoTON.initiate(
      simple.DaoTON.start,
      simple.DaoTON.cliffDurationInSeconds,
      simple.DaoTON.durtation
    );
  }
  if (process.env.SET) {
    setSwapperStart(vestingSwapper, vesting.startTimeStamp);
    setSwapperStart(simpleSwapper, simple.startTimestamp);

    await simpleSwapper.setVault(simple.TONVault);
    await vestingSwapper.setVault(vesting.TONVault);
  }
  if (process.env.OWNERSHIP) {
    const simpleAddress = param.simpleSwapper.address;
    const TON = await Ton.at(simple.TONAddress);

    await TeamTON.changeController(simpleAddress);
    await BusinessTON.changeController(simpleAddress);
    await daoTON.changeController(simpleAddress);
    await AdvisorTON.changeController(simpleAddress);
    await ReserveTON.changeController(simpleAddress);

    await TON.transferOwnership(param.ownership.parameters.TONOwner);
    await Vault.transferPrimary(param.ownership.parameters.ZERO_ONE_ADDRESS);

    await simpleSwapper.changeController(param.ownership.parameters.ZERO_ADDRESS);
    await vestingSwapper.transferPrimary(param.ownership.parameters.ZERO_ONE_ADDRESS);
  }
};
