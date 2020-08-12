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
    process.env.SET ||
    process.env.OWNERSHIP
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
  }

  if (process.env.SEEDINIT) {
    await vestingSwapper.updateRatio(
      vesting.seedTON.address,
      vesting.seedTON.seedRatio
    );
    console.log('update seed done');
    // token, start, cliff, first claim duration, first claim amount, duration
    await vestingSwapper.initiate(
      vesting.seedTON.address,
      vesting.seedTON.start,
      vesting.seedTON.cliffDurationInSeconds,
      vesting.seedTON.firstClaimDurationInSeconds,
      vesting.seedTON.firstClaimAmount,
      vesting.seedTON.durationUnit
    );
    console.log('init seed done');

    // await SeedTON.changeController(param.ownership.parameters.ZERO_ADDRESS);
  }
  if (process.env.PRIVATEINIT) {
    await vestingSwapper.updateRatio(
      vesting.privateTON.address,
      vesting.privateTON.privateRatio
    );
    console.log('update priv done');
    await vestingSwapper.initiate(
      vesting.privateTON.address,
      vesting.privateTON.start,
      vesting.privateTON.cliffDurationInSeconds,
      vesting.privateTON.firstClaimDurationInSeconds,
      vesting.privateTON.firstClaimAmount,
      vesting.privateTON.durationUnit
    );
    console.log('init priv done');
  }
  if (process.env.STRATEGICINIT) {
    await vestingSwapper.updateRatio(
      vesting.strategicTON.address,
      vesting.strategicTON.strategicRatio
    );
    console.log('update st done');
    await vestingSwapper.initiate(
      vesting.strategicTON.address,
      vesting.strategicTON.start,
      vesting.strategicTON.cliffDurationInSeconds,
      vesting.strategicTON.firstClaimDurationInSeconds,
      vesting.strategicTON.firstClaimAmount,
      vesting.strategicTON.durationUnit
    );
    console.log('init st done');

    // await StrategicTON.changeController(param.ownership.parameters.ZERO_ADDRESS);
  }
  if (process.env.MARKETINGINIT) {
    await simpleSwapper.updateRatio(
      vesting.marketingTON.address,
      vesting.marketingTON.marketingRatio
    );
    console.log('update mton done');
    await vestingSwapper.updateRatio(
      vesting.marketingTON.address,
      vesting.marketingTON.marketingRatio
    );
    console.log('update mton done');
    await vestingSwapper.initiate(
      vesting.marketingTON.address,
      vesting.marketingTON.start,
      vesting.marketingTON.cliffDurationInSeconds,
      vesting.marketingTON.firstClaimDurationInSeconds,
      vesting.marketingTON.firstClaimAmount,
      vesting.marketingTON.durationUnit
    );
    console.log('init mton done');

    // await MarketingTON.changeController(param.simpleSwapper.address);
  }
  if (process.env.TEAMINIT) {
    await simpleSwapper.updateRatio(
      simple.TeamTON.address,
      simple.TeamTON.teamRatio
    );
    console.log('update adv done');
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
    console.log('update adv done');
    await AdvisorTON.initiate(
      simple.AdvisorTON.start,
      simple.AdvisorTON.cliffDurationInSeconds,
      simple.AdvisorTON.duration
    );
    console.log('init biz done');
  }
  if (process.env.BUSINESSINIT) {
    await simpleSwapper.updateRatio(
      simple.BusinessTON.address,
      simple.BusinessTON.businessRatio
    );
    console.log('update done');
    await BusinessTON.initiate(
      simple.BusinessTON.start,
      simple.BusinessTON.cliffDurationInSeconds,
      simple.BusinessTON.duration
    );
    console.log('init biz done');
  }
  if (process.env.RESERVEINIT) {
    await simpleSwapper.updateRatio(
      simple.ReserveTON.address,
      simple.ReserveTON.reserveRatio
    );
    console.log('update reserve done');
    await ReserveTON.initiate(
      simple.ReserveTON.start,
      simple.ReserveTON.cliffDurationInSeconds,
      simple.ReserveTON.duration
    );
    console.log('init reserve done');
  }
  if (process.env.DAOINIT) {
    await simpleSwapper.updateRatio(
      simple.DaoTON.address,
      simple.DaoTON.daoRatio
    );
    console.log('update dao done');
    await daoTON.initiate(
      simple.DaoTON.start,
      simple.DaoTON.cliffDurationInSeconds,
      simple.DaoTON.duration
    );
    console.log('init dao done');
  }
  if (process.env.SET) {
    setSwapperStart(vestingSwapper, param.vestingSwapper.startTimeStamp);
    setSwapperStart(simpleSwapper, param.simpleSwapper.parameters.startTimestamp);
    console.log('set done');
    await simpleSwapper.setVault(simple.valutAddress);
    console.log('set simple vault done');
    await vestingSwapper.setVault(vesting.vaultAddress);
    console.log('set vesting vault done');
    await vestingSwapper.addUsingBurnerContract(param.vestingSwapper.seedTON.address);
    console.log('set seedton as using burner contract');
    await vestingSwapper.addUsingBurnerContract(param.vestingSwapper.privateTON.address);
    console.log('set privateton as using burner contract');
    await vestingSwapper.addUsingBurnerContract(param.vestingSwapper.strategicTON.address);
    console.log('set strategicton as using burner contract');
    
  }
  // if (process.env.OWNERSHIP) {
  //   const simpleAddress = param.simpleSwapper.address;
  //   const TON = await Ton.at(param.simpleSwapper.parameters.TONAddress);
  //   const vault = await Vault.at(param.mintTON.parameters.tonVaultAddress);

  //   // addUsingBurner
  //   await TeamTON.changeController(simpleAddress);
  //   await BusinessTON.changeController(simpleAddress);
  //   await daoTON.changeController(simpleAddress);
  //   await AdvisorTON.changeController(simpleAddress);
  //   await ReserveTON.changeController(simpleAddress);
  //   console.log('change controller done');

  //   await TON.transferOwnership(param.ownership.parameters.TONOwner);
  //   await vault.transferPrimary(param.ownership.parameters.ZERO_ONE_ADDRESS);
  //   console.log('transfer owner ship done');

  //   await simpleSwapper.transferPrimary(param.ownership.parameters.ZERO_ONE_ADDRESS);
  //   await vestingSwapper.transferPrimary(param.ownership.parameters.ZERO_ONE_ADDRESS);
  //   console.log('transfer primary done');
  // }
};
