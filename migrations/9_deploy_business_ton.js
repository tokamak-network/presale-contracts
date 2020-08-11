const { BN, toWei } = require('web3-utils');

const VestingToken = artifacts.require('VestingTokenStep');
const fs = require('fs');
const accounts = require('../test_accounts.json');
const parameter = require('./variables.js');

const ether = n => new BN(toWei(n, 'ether'));

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const totalSupply = ether('100000');

module.exports = async function (deployer) {
  if (process.env.BUSINESS) {
    let token;
    await deployer.deploy(VestingToken,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      0,
      'Business Tokamak Network Token',
      18,
      'BTON',
      true,
    ).then(async () => { token = await VestingToken.deployed(); })
      .then(() => token.generateTokens(
        parameter.businessTON.parameters.businessTONHolder,
        parameter.businessTON.parameters.generatedAmount
      ))
      .catch((e) => {
        console.error(e);
        throw e;
      });
    const data = JSON.parse(fs.readFileSync('deployed.json').toString());
    data.BusinessTON = token.address;
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
  }
};
