const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;
const Web3 = require('web3');
const { networks } = require('../truffle-config.js');

const VestingToken = artifacts.require('VestingToken');
const VestingTokenStep = artifacts.require('VestingTokenStep');
const TON = artifacts.require('TON');

const VestingSwapper = artifacts.require('VestingSwapper');
const SwapperStep = artifacts.require('StepSwapper')
const Vault = artifacts.require('TONVault');
const Privatesale = artifacts.require('Privatesale');
const fs = require('fs');
const accounts = require('../test_accounts.json');

const seedAddress = '0x279418C435d50768958C3602f36e38Afa424cc99';
const privateAddress = '0xaeb25ad2512c237820A7d2094194E1e46c279bDf';
const strategicAddress = '0x08536cfDFff2ab0A67eE5d3FF4Dca8Ea03e0aaF2';

const wallet = '0xF8e1d287C5Cc579dd2A2ceAe6ccf4FbfBe4CA2F5';
const decimal = new BN('18');
const totalSupply = ether('224000.1');

module.exports = async function (deployer) {
  if (process.env.VESTINGINIT) {
    const data = JSON.parse(fs.readFileSync('deployed.json').toString());

    // match SwapperStep <-> VestingTokenStep, VestingSwapper <-> VestingToken
    // VestingToken
    const seedTon = await VestingToken.at(data.seedTon);
    const privateTon = await VestingToken.at(data.privateTon);
    const strategicTon = await VestingToken.at(data.strategicTon);
    
    // VestingTokenStep
    const teamTon = await VestingTokenStep.at(data.teamTon);
    const advisorTon = await VestingTokenStep.at(data.advisorTon);
    const businessTon = await VestingTokenStep.at(data.businessTon);
    const reserveTon = await VestingTokenStep.at(data.reserveTon);
    const daoTon = await VestingTokenStep.at(data.daoTon);
    const ton = await TON.at(data.TON);
    const vault = await Vault.at(data.TONVault);

    // Swapper
    const vestingSwapper = await VestingSwapper.at(data.VestingSwapper);
    const stepSwapper = await SwapperStep.at(data.StepSwapper);

    // update swap ratio of vestingSwapper
    await vestingSwapper.updateRatio(seedTon.address, 50);
    await vestingSwapper.updateRatio(privateTon.address, 50);
    await vestingSwapper.updateRatio(strategicTon.address, 50);

    // update swap ratio of stepSwapper
    // await swapper.updateRate(marketingTon.address, 1);
    await stepSwapper.updateRate(teamTon.address, 50);
    await stepSwapper.updateRate(advisorTon.address, 50);
    await stepSwapper.updateRate(businessTon.address, 50);
    await stepSwapper.updateRate(reserveTon.address, 50);
    await stepSwapper.updateRate(daoTon.address, 50);
 
    // initiate seed, private, strategic TON
    await vestingSwapper.initiate(seedTon.address, (Date.now() / 1000 | 0) + 120, 0, 0, 0, 6);
    await vestingSwapper.initiate(privateTon.address, (Date.now() / 1000 | 0) + 120, 0, 0, 0, 10);
    await vestingSwapper.initiate(strategicTon.address, (Date.now() / 1000 | 0) + 120, 0, 0, 0, 10);

    // initiate another TON
    await teamTon.initiate((Date.now() / 1000 | 0) + 120, 0, 10);
    await advisorTon.initiate((Date.now() / 1000 | 0) + 120, 0, 10);
    await businessTon.initiate((Date.now() / 1000 | 0) + 120, 0, 10);
    await reserveTon.initiate((Date.now() / 1000 | 0) + 120, 0, 10);
    await daoTon.initiate((Date.now() / 1000 | 0) + 120, 0, 10);

    // change controller for vestingSwapper
    await seedTon.changeController(vestingSwapper.address);
    await privateTon.changeController(vestingSwapper.address);
    await strategicTon.changeController(vestingSwapper.address);

    // change controller for stepSwapper
    await teamTon.changeController(stepSwapper.address);
    await advisorTon.changeController(stepSwapper.address);
    await businessTon.changeController(stepSwapper.address);
    await reserveTon.changeController(stepSwapper.address);
    await daoTon.changeController(stepSwapper.address);
  } else if (process.env.DAEMONTEST) {
    const data = JSON.parse(fs.readFileSync('deployed_test.json').toString());

    const token1 = await VestingToken.at(data.VestingTokenAddress1);
    const token2 = await VestingToken.at(data.VestingTokenAddress2);
    const token3 = await VestingToken.at(data.VestingTokenAddress3);
    const token4 = await VestingToken.at(data.VestingTokenAddress4);
    const token5 = await VestingToken.at(data.VestingTokenAddress5);
    const token6 = await VestingToken.at(data.VestingTokenAddress6);
    const ton = await TON.at(data.TON);
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
