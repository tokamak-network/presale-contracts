const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;
const fs = require('fs');
const accounts = require('../test_accounts.json');

const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory');
const VestingToken = artifacts.require('VestingToken');
const Seedsale = artifacts.require('Seedsale');

const numerator = new BN('100');
const denominator = new BN('3');
const minCap = ether('200');
const cap = ether('900');
const wallet = '0xF8e1d287C5Cc579dd2A2ceAe6ccf4FbfBe4CA2F5';
const decimal = new BN('18');
const totalSupply = ether('1500000');

module.exports = async function (deployer) {
  if (process.env.SEEDSALE) {
    let seedToken, seedSale;
    await deployer.deploy(VestingToken,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      0,
      'Seedsale Tokamak Network Token',
      18,
      'SeedTON',
      true,
    ).then(async () => { seedToken = await VestingToken.deployed(); })
      .then(() => deployer.deploy(Seedsale,
        numerator,
        denominator,
        wallet,
        seedToken.address,
        cap,
        minCap,
      ))
      .then(async () => { seedSale = await Seedsale.deployed(); })
      .then(() => seedToken.generateTokens(accounts.owner, totalSupply))
    fs.writeFile('deployed.json', '{}', (err) => { if (err) throw err; });
    const data = {};
    data.seedTon = seedToken.address;
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
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
    data.seedTon = token.address;
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
