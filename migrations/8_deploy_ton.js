const TON = artifacts.require('TON');
const fs = require('fs');
const { BN, constants, ether } = require('openzeppelin-test-helpers');
const accounts = require('../test_accounts.json');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const wallet = '0xf35A0c48c970d5abFBC1B33096A83bFc87A4a82E';
const decimal = new BN('18');
const totalSupply = ether('224000.1');


module.exports = async function (deployer) {
  if (process.env.DAEMONTEST || process.env.SEEDSALE || process.env.PRIVATESALE || process.env.STRATEGICSALE) {
    let token;
    await deployer.deploy(TON).then(async () => { token = await TON.deployed(); })
    .then(() => token.mint(accounts['owner'], ether('10000000')));
    let data = JSON.parse(fs.readFileSync('deployed_test.json').toString());
    data['TON'] = (await TON.deployed()).address
    fs.writeFile('deployed_test.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
  }
};
