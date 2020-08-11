const SimpleSwapper = artifacts.require('Swapper');
const TON = artifacts.require('TON');
const fs = require('fs');
const { BN, constants, ether } = require('openzeppelin-test-helpers');
const param = require('./variables.js');

module.exports = async function (deployer) {
  if (process.env.SWAPPER) {
    let swapper;
    const data = JSON.parse(fs.readFileSync('deployed.json').toString());
    await deployer.deploy(
      SimpleSwapper,
      param.simpleSwapper.parameters.TONAddress,
      param.simpleSwapper.parameters.MTONAddress
    ).then(async () => {
      swapper = await SimpleSwapper.deployed();
    });
    data.SimpleSwapper = swapper.address;
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
  }
};
