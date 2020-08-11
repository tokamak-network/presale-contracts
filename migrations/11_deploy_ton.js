const TON = artifacts.require('TON');
const fs = require('fs');
const { BN, constants, ether } = require('openzeppelin-test-helpers');
const param = require('./variables.js');
const initialHolder = '0xDf08F82De32B8d460adbE8D72043E3a7e25A3B39';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

module.exports = async function (deployer) {
  if (process.env.TON) {
    let token;
    await deployer.deploy(TON).then(async () => { token = await TON.deployed(); });
    const data = JSON.parse(fs.readFileSync('deployed.json').toString());
    data.TON = (await TON.deployed()).address;
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
  }
};
