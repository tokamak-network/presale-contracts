const SimpleSwapper = artifacts.require('Swapper');
const TON = artifacts.require('TON');
const fs = require('fs');
const { BN, constants, ether } = require('openzeppelin-test-helpers');

module.exports = async function (deployer) {
  if (process.env.SWAPPER) {
    let swapper;
    let data = JSON.parse(fs.readFileSync('deployed.json').toString());
    await deployer.deploy(SimpleSwapper, data.TON).then(async () => { swapper = await SimpleSwapper.deployed(); })
    data.SimpleSwapper = swapper.address;
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
    // let ton = await TON.at(data['TON']);
    // await ton.transfer(swapper.address, ether('10000'));
  }
};
