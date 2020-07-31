const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;
const fs = require('fs');
const accounts = require('../test_accounts.json');

const VestingToken = artifacts.require('VestingToken');
const info = require('../config.js');

const totalSupply = ether('30000');

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
    .then(() => token.generateTokens(accounts.owner, info.seed.totalSupply))
    fs.writeFile('deployed.json', '{}', (err) => { if (err) throw err; });
    const data = {};
    data.SeedTON = token.address;
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
    await token.transfer(accounts.holder1, ether('110.11'), { from: accounts.owner });
    await token.transfer(accounts.holder2, ether('220.22'), { from: accounts.owner });
    await token.transfer(accounts.holder3, ether('330.33'), { from: accounts.owner });
    await token.transfer(accounts.holder4, ether('440.44'), { from: accounts.owner });
    await token.transfer(accounts.holder5, ether('350.55'), { from: accounts.owner });
    await token.transfer(accounts.holder6, ether('110.11'), { from: accounts.owner });
    await token.transfer(accounts.holder7, ether('220.22'), { from: accounts.owner });
    await token.transfer(accounts.holder8, ether('330.33'), { from: accounts.owner });
    await token.transfer(accounts.holder9, ether('440.44'), { from: accounts.owner });
    await token.transfer(accounts.holder10, ether('220.22'), { from: accounts.owner });
    await token.transfer(accounts.holder11, ether('543.00'), { from: accounts.owner });
    await token.transfer(accounts.holder12, ether('440.44'), { from: accounts.owner });
    

  } else if (process.env.DAEMONTEST) {
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
      .then(() => token.generateTokens(accounts.owner, totalSupply));
    fs.writeFile('deployed_test.json', '{}', (err) => { if (err) throw err; });
    // let data = JSON.parse(fs.readFileSync('deployed_test.json').toString());
    const data = {};
    data.seedTON = token.address;
    fs.writeFile('deployed_test.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
    await token.transfer(accounts.holder1, ether('11.11'));
    await token.transfer(accounts.holder2, ether('22.22'));
    await token.transfer(accounts.holder3, ether('33.33'));
    await token.transfer(accounts.holder4, ether('44.44'));
    await token.transfer(accounts.holder5, ether('55.55'));
  }
};
