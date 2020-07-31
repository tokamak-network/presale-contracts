const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;
const Web3 = require('web3');
const { networks } = require('../truffle-config.js');

const VestingToken = artifacts.require('VestingToken');
const VestingTokenStep = artifacts.require('VestingTokenStep');
const TON = artifacts.require('TON');
const parameter = require('../config.js');

const VestingSwapper = artifacts.require('VestingSwapper');
const SimpleSwapper = artifacts.require('Swapper')
const Vault = artifacts.require('TONVault');
const Burner = artifacts.require('Burner');

const fs = require('fs');
const accounts = require('../test_accounts.json');

const seedAddress = '0x279418C435d50768958C3602f36e38Afa424cc99';
const privateAddress = '0xaeb25ad2512c237820A7d2094194E1e46c279bDf';
const strategicAddress = '0x08536cfDFff2ab0A67eE5d3FF4Dca8Ea03e0aaF2';

const oneDays = 60 * 60 * 6;

async function setSwapperStart(swapper, start) {
  let startInContract = await swapper.startTimestamp;
  if (startInContract != start) {
    await swapper.setStart(start);
  }
}

module.exports = async function (deployer) {
  let data, vestingSwapper, simpleSwapper, burner;

  if (process.env.SEEDINIT || process.env.PRIVATEINIT || process.env.STRATEGICINIT || process.env.MARKETINGINIT || process.env.TEAMINIT || process.env.ADVISORINIT || process.env.BUSINESSINIT || process.env.RESERVEINIT || process.env.DAOINIT || process.env.SETVAULTSIMPLE || process.env.SETVAULTVESTING) {
    data = JSON.parse(fs.readFileSync('deployed.json').toString());
    
    vestingSwapper = await VestingSwapper.at(data.VestingSwapper);
    simpleSwapper = await SimpleSwapper.at(data.SimpleSwapper);
    burner = await Burner.at(data.Burner);
  }

  const start = (Date.now() / 1000 | 0) + 10;
  if (process.env.SEEDINIT) {
    const SeedTON = await VestingToken.at(data.SeedTON);
    const seed = parameter.seed;
    await vestingSwapper.updateRatio(SeedTON.address, 50);
    // token, start, cliff, first claim duration, first claim amount, duration
    await vestingSwapper.initiate(SeedTON.address, start, 0, seed.firstClaimDurationInSeconds, seed.firstClaimAmountInTon.div(seed.ratio), oneDays*6);
    
    await SeedTON.changeController(vestingSwapper.address);
  }
  if (process.env.PRIVATEINIT) {
    const private = parameter.private
    const PrivateTON = await VestingToken.at(data.PrivateTON);
    await vestingSwapper.updateRatio(PrivateTON.address, 50);
    await vestingSwapper.initiate(PrivateTON.address, start, 0, private.firstClaimDurationInSeconds, private.firstClaimAmountInTon.div(private.ratio), oneDays*10);
    
    await PrivateTON.changeController(vestingSwapper.address);
  }
  if (process.env.STRATEGICINIT) {
    const strategic = parameter.strategic
    const StrategicTON = await VestingToken.at(data.StrategicTON);
    await vestingSwapper.updateRatio(StrategicTON.address, 50);
    await vestingSwapper.initiate(StrategicTON.address, start, 0, strategic.firstClaimDurationInSeconds, strategic.firstClaimAmountInTon.div(strategic.ratio), oneDays*10);
    
    await StrategicTON.changeController(vestingSwapper.address);
  }
  if (process.env.MARKETINGINIT) {
    const MarketingTON = await VestingToken.at(data.MarketingTON);
    await simpleSwapper.updateRatio(MarketingTON.address, 1);
    // await vestingSwapper.initiate(marketingTON.address, start, 0, 0, 0, oneDays);
    
  }
  if (process.env.TEAMINIT) {
    const TeamTON = await VestingTokenStep.at(data.TeamTON);
    await simpleSwapper.updateRatio(TeamTON.address, 50);
    await TeamTON.initiate(start, 0, oneDays*36);

    await TeamTON.changeController(simpleSwapper.address);
  }
  if (process.env.ADVISORINIT) {
    const AdvisorTON = await VestingTokenStep.at(data.AdvisorTON);
    await simpleSwapper.updateRatio(AdvisorTON.address, 50);
    await AdvisorTON.initiate(start, 0, oneDays*18);
    
    await AdvisorTON.changeController(simpleSwapper.address);
  }
  if (process.env.BUSINESSINIT) {
    const BusinessTON = await VestingTokenStep.at(data.BusinessTON);
    await simpleSwapper.updateRatio(BusinessTON.address, 50);
    await BusinessTON.initiate(start, 0, oneDays*20);
    
    await BusinessTON.changeController(simpleSwapper.address);
  }
  if (process.env.RESERVEINIT) {
    const ReserveTON = await VestingTokenStep.at(data.ReserveTON);
    await simpleSwapper.updateRatio(ReserveTON.address, 50);
    await ReserveTON.initiate(start, 0, oneDays*30);
    
    await ReserveTON.changeController(simpleSwapper.address);
  }
  // if (process.env.DAOINIT) {
  //   const daoTON = await VestingTokenStep.at(data.daoTON);
  //   await simpleSwapper.updateRatio(daoTON.address, 50);
  //   await daoTON.initiate(start, 0, oneDays*5);
    
  //   await daoTON.changeController(simpleSwapper.address);
  // }
  if (process.env.SETVAULTSIMPLE) {
    await simpleSwapper.setVault(data.TONVault);
    await simpleSwapper.setBurner(data.Burner)
  }
  if (process.env.SETVAULTVESTING) {
    await vestingSwapper.setVault(data.TONVault);
    await vestingSwapper.setBurner(data.Burner);
  }
  if (process.env.SETSWAPPER) {
    setSwapperStart(vestingSwapper, start);
    setSwapperStart(simpleSwapper, start);
  }
  if (process.env.DAEMONTEST) {
    const data = JSON.parse(fs.readFileSync('deployed_test.json').toString());

    const token1 = await VestingToken.at(data.VestingTokenAddress1);
    const token2 = await VestingToken.at(data.VestingTokenAddress2);
    const token3 = await VestingToken.at(data.VestingTokenAddress3);
    const token4 = await VestingToken.at(data.VestingTokenAddress4);
    const token5 = await VestingToken.at(data.VestingTokenAddress5);
    const token6 = await VestingToken.at(data.VestingTokenAddress6);
    const TON = await TON.at(data.TON);
    const swapper = await Swapper.at(data.Swapper);

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
