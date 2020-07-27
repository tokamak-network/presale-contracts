const { BN, toWei } = require('web3-utils');

const VestingToken = artifacts.require('VestingTokenStep');
const fs = require('fs');
const accounts = require('../test_accounts.json');

const ether = n => new BN(toWei(n, 'ether'));

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const wallet = '0xF8e1d287C5Cc579dd2A2ceAe6ccf4FbfBe4CA2F5';
const totalSupply = ether('1500000'); // divide 50

module.exports = async function (deployer) {
  if (process.env.ADVISOR) {
    let token, sale;
    await deployer.deploy(VestingToken,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      0,
      'Advisor Tokamak Network Token',
      18,
      'AdvisorTON',
      true,
    ).then(async () => { token = await VestingToken.deployed(); })
      .then(() => token.generateTokens(accounts.owner, totalSupply))
      .catch((e) => {
        console.error(e);
        throw e;
      });
    const data = JSON.parse(fs.readFileSync('deployed.json').toString());
    data.advisorTon = token.address;
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
  } else if (process.env.DAEMONTEST) {
    let token;
    await deployer.deploy(VestingToken,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      0,
      'Advisor Tokamak Network Token',
      18,
      'AdvisorTON',
      true,
    ).then(async () => { token = await VestingToken.deployed(); })
      .then(() => token.generateTokens(accounts.owner, totalSupply));
    const data = JSON.parse(fs.readFileSync('deployed_test.json').toString());
    data.advisorTon = token.address;
    fs.writeFile('deployed_test.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
    await token.transfer(accounts.holder1, ether('11.11'));
    await token.transfer(accounts.holder2, ether('22.22'));
    await token.transfer(accounts.holder6, ether('33.33'));
    await token.transfer(accounts.holder7, ether('44.44'));
    await token.transfer(accounts.holder8, ether('55.55'));
  }
};
