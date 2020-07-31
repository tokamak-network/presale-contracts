const VestingSwapper = artifacts.require('VestingSwapper');
const TON = artifacts.require('TON');
const fs = require('fs');
const { BN, constants, ether } = require('openzeppelin-test-helpers');

module.exports = async function (deployer) {
  if (process.env.VESTINGSWAPPER) {
    let swapper;
    let data = JSON.parse(fs.readFileSync('deployed.json').toString());
    await deployer.deploy(VestingSwapper, data.TON, data.marketingTON).then(async () => { swapper = await VestingSwapper.deployed(); })
    data.VestingSwapper = swapper.address;
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
    // let ton = await TON.at(data['TON']);
    // await ton.transfer(swapper.address, ether('10000'));
  }
};
