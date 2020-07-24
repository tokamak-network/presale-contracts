const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;
const Web3 = require('web3');
const { networks } = require('../truffle-config.js');

const VestingToken = artifacts.require('VestingToken');
const TON = artifacts.require('TON');
const Swapper = artifacts.require('Swapper');
const Privatesale = artifacts.require('Privatesale');
const fs = require('fs');
const accounts = require('../test_accounts.json');

const wallet = '0xF8e1d287C5Cc579dd2A2ceAe6ccf4FbfBe4CA2F5';
const decimal = new BN('18');
const totalSupply = ether('224000.1');

module.exports = async function (deployer) {
  if (process.env.VESTINGINIT) {
    const data = JSON.parse(fs.readFileSync('deployed.json').toString());

    const seedTon = await VestingToken.at(data.seedTon);
    const privateTon = await VestingToken.at(data.privateTon);
    const strategicTon = await VestingToken.at(data.strategicTon);
    // const marketingTon = await VestingToken.at(data.marketingTon);
    const publicTon = await VestingToken.at(data.publicTon);
    const teamTon = await VestingToken.at(data.teamTon);
    const advisorTon = await VestingToken.at(data.advisorTon);
    const businessTon = await VestingToken.at(data.businessTon);
    const reserveTon = await VestingToken.at(data.reserveTon);
    const daoTon = await VestingToken.at(data.daoTon);
    const ton = await TON.at(data.TON);
    const swapper = await Swapper.at(data.Swapper);

    await swapper.updateRate(seedTon.address, 50);
    await swapper.updateRate(privateTon.address, 50);
    await swapper.updateRate(strategicTon.address, 50);
    // await swapper.updateRate(marketingTon.address, 1);
    await swapper.updateRate(publicTon.address, 50);
    await swapper.updateRate(teamTon.address, 50);
    await swapper.updateRate(advisorTon.address, 50);
    await swapper.updateRate(businessTon.address, 50);
    await swapper.updateRate(reserveTon.address, 50);
    await swapper.updateRate(daoTon.address, 50);

    await seedTon.initiate((Date.now() / 1000 | 0) + 120, 0, 6);
    await privateTon.initiate((Date.now() / 1000 | 0) + 120, 0, 10);
    await strategicTon.initiate((Date.now() / 1000 | 0) + 120, 0, 10);
    await publicTon.initiate((Date.now() / 1000 | 0) + 120, 0, 10);
    await teamTon.initiate((Date.now() / 1000 | 0) + 120, 0, 10);
    await advisorTon.initiate((Date.now() / 1000 | 0) + 120, 0, 10);
    await businessTon.initiate((Date.now() / 1000 | 0) + 120, 0, 10);
    await reserveTon.initiate((Date.now() / 1000 | 0) + 120, 0, 10);
    await daoTon.initiate((Date.now() / 1000 | 0) + 120, 0, 10);

    await seedTon.changeController(swapper.address);
    await privateTon.changeController(swapper.address);
    await strategicTon.changeController(swapper.address);
    await publicTon.changeController(swapper.address);
    await teamTon.changeController(swapper.address);
    await advisorTon.changeController(swapper.address);
    await businessTon.changeController(swapper.address);
    await reserveTon.changeController(swapper.address);
    await daoTon.changeController(swapper.address);
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
