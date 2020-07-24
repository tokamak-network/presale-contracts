const TONVault = artifacts.require('TONVault');
const TON = artifacts.require('TON');
const VestingSwapper = artifacts.require('VestingSwapper');
const fs = require('fs');
const { BN, constants, ether } = require('openzeppelin-test-helpers');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const wallet = '0xf35A0c48c970d5abFBC1B33096A83bFc87A4a82E';
const decimal = new BN('18');
const totalSupply = ether('224000.1');


module.exports = async function (deployer) {
  if (process.env.DAEMONTEST || process.env.SEEDSALE || process.env.PRIVATESALE || process.env.STRATEGICSALE) {
    let vault;
    let data = JSON.parse(fs.readFileSync('deployed_test.json').toString());
    await deployer.deploy(TONVault, data['TON']).then(async () => { vault = await TONVault.deployed(); })
    data['TONVault'] = vault.address
    fs.writeFile('deployed_test.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
    let ton = await TON.at(data['TON']);
    //await ton.transfer(vault.address, ether('10000'));
    //let swapper = await VestingSwapper.at(data['VestingSwapper']);
    await vault.setApprovalAmount(data['VestingSwapper'], ether('10000'));
  }
};
