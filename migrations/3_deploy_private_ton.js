const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const VestingToken = artifacts.require('VestingToken');
const Privatesale = artifacts.require('Privatesale');
const fs = require('fs');
const accounts = require('../test_accounts.json');
const parameter = require('../config.js');

const wallet = '0xF8e1d287C5Cc579dd2A2ceAe6ccf4FbfBe4CA2F5';
const decimal = new BN('18');
const totalSupply = ether('144000.083230664748493368');

module.exports = async function (deployer) {
  if (process.env.PRIVATE) {
    let token, sale;

    await deployer.deploy(VestingToken,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      0,
      'Privatesale Tokamak Network Token',
      18,
      'PrivateTON',
      true,
    ).then(async () => { token = await VestingToken.deployed(); })
    .then(() => token.generateTokens(accounts.owner, parameter.private.totalSupply))
    const data = JSON.parse(fs.readFileSync('deployed.json').toString());
    data.PrivateTON = token.address;
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
    await token.transfer(accounts.holder1, ether('1100.11'), { from: accounts.owner });
    await token.transfer(accounts.holder2, ether('2200.22'), { from: accounts.owner });
    await token.transfer(accounts.holder3, ether('3300.33'), { from: accounts.owner });
    await token.transfer(accounts.holder4, ether('4400.44'), { from: accounts.owner });
    await token.transfer(accounts.holder5, ether('5500.55'), { from: accounts.owner });
    await token.transfer(accounts.holder6, ether('1100.11'), { from: accounts.owner });
    await token.transfer(accounts.holder7, ether('2200.22'), { from: accounts.owner });
    await token.transfer(accounts.holder8, ether('3300.33'), { from: accounts.owner });
    await token.transfer(accounts.holder9, ether('4400.44'), { from: accounts.owner });
    await token.transfer(accounts.holder10, ether('1862.98'), { from: accounts.owner });
    await token.transfer(accounts.holder11, ether('819.67'), { from: accounts.owner });
    await token.transfer(accounts.holder12, ether('1280'), { from: accounts.owner });

  } else if (process.env.DAEMONTEST) {
    let token;
    await deployer.deploy(VestingToken,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      0,
      'Privatesale Tokamak Network Token',
      18,
      'PrivateTON',
      true,
    ).then(async () => { token = await VestingToken.deployed(); })
      .then(() => token.generateTokens(accounts.owner, totalSupply));
    const data = JSON.parse(fs.readFileSync('deployed_test.json').toString());
    data.privateTON = token.address;
    fs.writeFile('deployed_test.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
    await token.transfer(accounts.holder1, ether('11.11'));
    await token.transfer(accounts.holder2, ether('22.22'));
    await token.transfer(accounts.holder3, ether('33.33'));
    await token.transfer(accounts.holder4, ether('44.44'));
    await token.transfer(accounts.holder6, ether('55.55'));
  }
};
