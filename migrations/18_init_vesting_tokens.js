const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;
const Web3 = require('web3');
const { networks } = require('../truffle-config.js');

const VestingToken = artifacts.require('VestingToken');
const VestingTokenStep = artifacts.require('VestingTokenStep');
const TON = artifacts.require('TON');

const VestingSwapper = artifacts.require('VestingSwapper');
const SimpleSwapper = artifacts.require('SimpleSwapper')
const Vault = artifacts.require('TONVault');
const Privatesale = artifacts.require('Privatesale');
const fs = require('fs');
const accounts = require('../test_accounts.json');

const seedAddress = '0x279418C435d50768958C3602f36e38Afa424cc99';
const privateAddress = '0xaeb25ad2512c237820A7d2094194E1e46c279bDf';
const strategicAddress = '0x08536cfDFff2ab0A67eE5d3FF4Dca8Ea03e0aaF2';

const oneDays = 60 * 60 * 24;

module.exports = async function (deployer) {
  const data = JSON.parse(fs.readFileSync('deployed.json').toString());
  
  const vestingSwapper = await VestingSwapper.at(data.VestingSwapper);
  const simpleSwapper = await SimpleSwapper.at(data.SimpleSwapper);
  if (process.env.SEEDINIT) {
    const seedTON = await VestingToken.at(data.seedTON);
    await vestingSwapper.updateRatio(seedTON.address, 50);
    await vestingSwapper.initiate(seedTON.address, (Date.now() / 1000 | 0) + 10, oneDays, oneDays*2, 0, oneDays*6);
    await seedTON.changeController(vestingSwapper.address);
  }
  if (process.env.PRIVATEINIT) {
    const privateTON = await VestingToken.at(data.privateTON);
    await vestingSwapper.updateRatio(privateTON.address, 50);
    await vestingSwapper.initiate(privateTON.address, (Date.now() / 1000 | 0) + 10, oneDays, oneDays*2, 0, oneDays*10);
    await privateTON.changeController(vestingSwapper.address);
  }
  if (process.env.STRATEGICINIT) {
    const strategicTON = await VestingToken.at(data.strategicTON);
    await vestingSwapper.updateRatio(strategicTON.address, 50);
    await vestingSwapper.initiate(strategicTON.address, (Date.now() / 1000 | 0) + 10, oneDays, oneDays*2, 0, oneDays*10);
    await strategicTON.changeController(vestingSwapper.address);
  }
  if (process.env.MARKETINGINIT) {
    const marketingTON = await VestingToken.at(data.marketingTON);
    await vestingSwapper.updateRatio(marketingTON.address, 1);
    await vestingSwapper.initiate(strategicTON.address, (Date.now() / 1000 | 0) + 10, 0, 0, 0, 0);
    await marketingTON.changeController(vestingSwapper.address);
  }
  if (process.env.TEAMINIT) {
    const teamTON = await VestingTokenStep.at(data.teamTON);
    await simpleSwapper.updateRate(teamTON.address, 50);
    await teamTON.initiate((Date.now() / 1000 | 0) + 10, 0, oneDays*36);
    await teamTON.changeController(simpleSwapper.address);
  }
  if (process.env.ADVISORINIT) {
    const advisorTON = await VestingTokenStep.at(data.advisorTON);
    await simpleSwapper.updateRate(advisorTON.address, 50);
    await advisorTON.initiate((Date.now() / 1000 | 0) + 10, 0, oneDays*18);
    await advisorTON.changeController(simpleSwapper.address);
  }
  if (process.env.BUSINESSINIT) {
    const businessTON = await VestingTokenStep.at(data.businessTON);
    await simpleSwapper.updateRate(businessTON.address, 50);
    await businessTON.initiate((Date.now() / 1000 | 0) + 10, 0, oneDays*20);
    await businessTON.changeController(simpleSwapper.address);
  }
  if (process.env.RESERVEINIT) {
    console.log(data.daoTON);
    const reserveTON = await VestingTokenStep.at(data.reserveTON);
    await simpleSwapper.updateRate(reserveTON.address, 50);
    await reserveTON.initiate((Date.now() / 1000 | 0) + 10, 0, oneDays*30);
    await reserveTON.changeController(simpleSwapper.address);
  }
  if (process.env.DAOINIT) {
    const daoTON = await VestingTokenStep.at(data.daoTON);
    await simpleSwapper.updateRate(daoTON.address, 50);
    await daoTON.initiate((Date.now() / 1000 | 0) + 10, 0, oneDays*5);
    await daoTON.changeController(simpleSwapper.address);
  }
  if (process.env.SETVAULTSIMPLE) {
    await simpleSwapper.setVault(data.TONVault,{ from: accounts.owner });
  }
  if (process.env.SETVAULTVESTING) {
    await vestingSwapper.setVault(data.TONVault);
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
