const { BN, toWei } = require('web3-utils');

const VestingToken = artifacts.require('VestingTokenStep');
const fs = require('fs');
const parameter = require('./variables.js');

const ether = n => new BN(toWei(n, 'ether'));

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

module.exports = async function (deployer) {
  if (process.env.TEAM) {
    let token;
    await deployer.deploy(VestingToken,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      0,
      'Team Tokamak Network Token',
      18,
      'TTON',
      true,
    ).then(async () => { token = await VestingToken.deployed(); })
      .then(() => token.generateTokens(
        parameter.teamTON.parameters.teamTONHolder,
        parameter.teamTON.parameters.generatedAmount
      ))
      .catch((e) => {
        console.error(e);
        throw e;
      });
    const data = JSON.parse(fs.readFileSync('deployed.json').toString());
    data.TeamTON = token.address;
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
  }
};
