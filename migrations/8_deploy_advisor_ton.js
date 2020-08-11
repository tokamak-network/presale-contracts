const { BN, toWei } = require('web3-utils');

const VestingToken = artifacts.require('VestingTokenStep');
const fs = require('fs');
const accounts = require('../test_accounts.json');

const ether = n => new BN(toWei(n, 'ether'));

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const totalSupply = ether('30000'); // divide 50
const parameter = require('./variables.js');

module.exports = async function (deployer) {
  if (process.env.ADVISOR) {
    let token, sale;
    await deployer.deploy(VestingToken,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      0,
      'Advisor Tokamak Network Token',
      18,
      'ATON',
      true,
    ).then(async () => { token = await VestingToken.deployed(); })
      .then(() => token.generateTokens(
        parameter.advisorTON.parameters.advisorTONHolder,
        parameter.advisorTON.parameters.generatedAmount
      ))
      .catch((e) => {
        console.error(e);
        throw e;
      });
    const data = JSON.parse(fs.readFileSync('deployed.json').toString());
    data.AdvisorTON = token.address;
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
  }
};
