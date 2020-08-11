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
    burner = await Burner.at(data.Burner);
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
      vesting.seedTON.durationInUnit
    );

    await SeedTON.changeController(vesting.address);
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
      vesting.privateTON.durationInUnit
    );

    await PrivateTON.changeController(vesting.address);
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
      vesting.strategicTON.durationInUnit
    );

    await StrategicTON.changeController(vesting.address);
  }
  if (process.env.MARKETINGINIT) {
    const MarketingTON = await VestingToken.at(
      vesting.marketingTON.MarketingTON
    );
    await simpleSwapper.updateRatio(
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
  if (process.env.SETVAULTSIMPLE) {
    await simpleSwapper.setVault(data.TONVault);
    await simpleSwapper.setBurner(data.Burner);
  }
  if (process.env.SETVAULTVESTING) {
    await vestingSwapper.setVault(data.TONVault);
    await vestingSwapper.setBurner(data.Burner);
  }
  if (process.env.SETSWAPPER) {
    setSwapperStart(vestingSwapper, param.vestingSwapper.startTimestamp);
    setSwapperStart(simpleSwapper, param.simpleSwapper.startTimestamp);
  }
  // if (process.env.TRANSFER) {
  //   const SeedTON = await VestingToken.at(data.SeedTON);
  //   await SeedTON.transferOwnership();
  // }
  if (process.env.DAEMONTEST) {
    const data = JSON.parse(fs.readFileSync('deployed_test.json').toString());

    const token1 = await VestingToken.at(data.VestingTokenAddress1);
    const token2 = await VestingToken.at(data.VestingTokenAddress2);
    const token3 = await VestingToken.at(data.VestingTokenAddress3);
    const token4 = await VestingToken.at(data.VestingTokenAddress4);
    const token5 = await VestingToken.at(data.VestingTokenAddress5);
    const token6 = await VestingToken.at(data.VestingTokenAddress6);
    const TON = await TON.at(data.TON);
    const swapper = await SimpleSwapper.at(data.Swapper);

    await swapper.updateRate(token1.address, 1);
    await swapper.updateRate(token2.address, 2);
    await swapper.updateRate(token3.address, 3);
    await swapper.updateRate(token4.address, 4);
    await swapper.updateRate(token5.address, 5);
    await swapper.updateRate(token6.address, 6);

    await token1.initiate((Date.now() / 1000 | 0) + 10, 0, 6);
    await token2.initiate((Date.now() / 1000 | 0) + 10, 0, 12);
    await token3.initiate((Date.now() / 1000 | 0) + 10, 0, 6);
    await token4.initiate((Date.now() / 1000 | 0) + 10, 0, 12);
    await token5.initiate((Date.now() / 1000 | 0) + 10, 0, 6);
    await token6.initiate((Date.now() / 1000 | 0) + 10, 0, 12);
    setSwapperStart(swapper, (Date.now() / 1000 | 0) + 10);

    await token1.changeController(swapper.address);
    await token2.changeController(swapper.address);
    await token3.changeController(swapper.address);
    await token4.changeController(swapper.address);
    await token5.changeController(swapper.address);
    await token6.changeController(swapper.address);

    const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));

    try {
      web3.currentProvider.send({
        method: 'evm_increaseTime',
        params: [60 * 60 * 24 * 61], // 61 days
        jsonrpc: '2.0',
        id: new Date().getTime(),
      });
      web3.currentProvider.send({
        method: 'evm_mine',
        params: [],
        jsonrpc: '2.0',
        id: new Date().getTime(),
      });
    } catch (err) {
      console.error(err);
    }
  }
};
