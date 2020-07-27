const StepSwapper = artifacts.require('StepSwapper');
const TON = artifacts.require('TON');
const fs = require('fs');
const { BN, constants, ether } = require('openzeppelin-test-helpers');

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
