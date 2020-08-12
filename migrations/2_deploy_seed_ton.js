const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;
const fs = require('fs');
const accounts = require('../test_accounts.json');

const VestingToken = artifacts.require('VestingToken');
const param = require('./variables.js');

module.exports = async function (deployer) {
  if (process.env.SEED) {
    let token;
    await deployer.deploy(VestingToken,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      0,
      'Seedsale Tokamak Network Token',
      18,
      'SeedTON',
      true,
    ).then(async () => { token = await VestingToken.deployed(); })
      .then(() => token.generateTokens(
        param.seedTON.parameters.holder,
        param.seedTON.parameters.amount
      ));
    fs.writeFile('deployed.json', '{}', (err) => { if (err) throw err; });
    const data = {};
    data.SeedTON = token.address;
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
  }
};
