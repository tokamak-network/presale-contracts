const VestingSwapper = artifacts.require('VestingSwapper');
const TON = artifacts.require('TON');
const fs = require('fs');
const param = require('./variables.js');

module.exports = async function (deployer) {
  if (process.env.VESTINGSWAPPER) {
    let swapper;
    const data = JSON.parse(fs.readFileSync('deployed.json').toString());
    await deployer.deploy(
      VestingSwapper,
      param.simpleSwapper.parameters.TONAddress,
      param.simpleSwapper.parameters.MTONAddress
    ).then(async () => { swapper = await VestingSwapper.deployed(); });
    data.VestingSwapper = swapper.address;
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
  }
};
