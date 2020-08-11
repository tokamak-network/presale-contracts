const { BN, toWei } = require('web3-utils');

const VestingToken = artifacts.require('VestingTokenStep');
const fs = require('fs');
const accounts = require('../test_accounts.json');
const parameter = require('./variables.js');

const ether = n => new BN(toWei(n, 'ether'));

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const totalSupply = ether('350000');

module.exports = async function (deployer) {
  if (process.env.DAO) {
    let token;
    await deployer.deploy(VestingToken,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      0,
      'DAO Tokamak Network Token',
      18,
      'DTON',
      true,
    ).then(async () => { token = await VestingToken.deployed(); })
      .then(() => token.generateTokens(
        parameter.daoTON.parameters.daoTONHolder,
        parameter.daoTON.parameters.generatedAmount
      ))
      .catch((e) => {
        console.error(e);
        throw e;
      });

    const data = JSON.parse(fs.readFileSync('deployed.json').toString());

    data.DaoTON = token.address;
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
  }
};
