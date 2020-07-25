const StepSwapper = artifacts.require('Swapper');
const TON = artifacts.require('TON');
const fs = require('fs');
const { BN, constants, ether } = require('openzeppelin-test-helpers');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const wallet = '0xF8e1d287C5Cc579dd2A2ceAe6ccf4FbfBe4CA2F5';
const decimal = new BN('18');
const totalSupply = ether('224000.1');

module.exports = async function (deployer) {
  if (process.env.DAEMONTEST || process.env.DAO || process.env.BUSINESS || process.env.RESERVE || process.env.ADVISOR || process.env.TEAM) {
    let swapper;
    let data = JSON.parse(fs.readFileSync('deployed.json').toString());
    await deployer.deploy(StepSwapper, data.TON).then(async () => { swapper = await StepSwapper.deployed(); })
    data.StepSwapper = swapper.address;
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
    // let ton = await TON.at(data['TON']);
    // await ton.transfer(swapper.address, ether('10000'));
  }
};
