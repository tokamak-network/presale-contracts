const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;
const Web3 = require('web3')
const { networks } = require('../truffle-config.js')

const VestingToken = artifacts.require('VestingToken');
const TON = artifacts.require('TON');
const Swapper = artifacts.require('Swapper');
const Privatesale = artifacts.require('Privatesale');
const fs = require('fs');
const accounts = require('../test_accounts.json');

const wallet = '0xf35A0c48c970d5abFBC1B33096A83bFc87A4a82E';
const decimal = new BN('18');
const totalSupply = ether('224000.1');

module.exports = async function (deployer) {
  if (process.env.VESTINGINIT) {
    let data = JSON.parse(fs.readFileSync('deployed_test.json').toString());

    let seedTon = await VestingToken.at(data['TON']);
    let privateTon = await VestingToken.at(data['privateTon']);
    let strategicTon = await VestingToken.at(data['strategicTon']);
    let ton = await TON.at(data['TON']);
    let swapper = await Swapper.at(data['Swapper']);

    await swapper.updateRate(seedTon.address, 10);
    await swapper.updateRate(privateTon.address, 20);
    await swapper.updateRate(strategicTon.address, 30);

    await seedTon.initiate((Date.now() / 1000 | 0) + 120, 0, 6);
    await privateTon.initiate((Date.now() / 1000 | 0) + 120, 0, 10);
    await strategicTon.initiate((Date.now() / 1000 | 0) + 120, 0, 10);

    await seedTon.changeController(swapper.address);
    await privateTon.changeController(swapper.address);
    await strategicTon.changeController(swapper.address);
  } else if (process.env.DAEMONTEST) {
    let data = JSON.parse(fs.readFileSync('deployed_test.json').toString());

    let token1 = await VestingToken.at(data['VestingTokenAddress1']);
    let token2 = await VestingToken.at(data['VestingTokenAddress2']);
    let token3 = await VestingToken.at(data['VestingTokenAddress3']);
    let token4 = await VestingToken.at(data['VestingTokenAddress4']);
    let token5 = await VestingToken.at(data['VestingTokenAddress5']);
    let token6 = await VestingToken.at(data['VestingTokenAddress6']);
    let ton = await TON.at(data['TON']);
    let swapper = await Swapper.at(data['Swapper']);

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

    const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

    try {
      web3.currentProvider.send({
        method: "evm_increaseTime",
        params: [60*60*24*61], // 61 days
        jsonrpc: "2.0",
        id: new Date().getTime()
      });
      web3.currentProvider.send({
        method: "evm_mine",
        params: [],
        jsonrpc: "2.0",
        id: new Date().getTime()
      });
    } catch (err) {
      console.error(err);
    }
  }
};
