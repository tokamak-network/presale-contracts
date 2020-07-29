const { BN, constants, ether } = require('openzeppelin-test-helpers');
const VestingToken = artifacts.require('VestingToken');
const holders = require('../private_ton_holders.js');
const fs = require('fs');
const accounts = require('../test_accounts.json');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

module.exports = async function (deployer) {
  if (process.env.PRIVATESALE) {
    if (holders.length !== 27) return;
    let token;
    deployer.deploy(VestingToken,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      0,
      'Privatesale Tokamak Network Token',
      18,
      'PrivateTON',
      true,
    ).then(async () => { token = await VestingToken.deployed(); })
      .then(async () => {
        const txs = holders.map(holder => token.generateTokens(holder.address, holder.amount));
        await Promise.all(txs);
      })
      .catch((e) => {
        console.error(e);
        throw e;
      });
      await token.transfer(accounts.holder1, ether('110.11'), { from: accounts.owner });
    await token.transfer(accounts.holder2, ether('220.22'), { from: accounts.owner });
    await token.transfer(accounts.holder6, ether('330.33'), { from: accounts.owner });
    await token.transfer(accounts.holder7, ether('440.44'), { from: accounts.owner });
    await token.transfer(accounts.holder8, ether('550.55'), { from: accounts.owner });
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
      .then(() => token.generateTokens(accounts.owner, ether('30000')));
    const data = JSON.parse(fs.readFileSync('deployed_test.json').toString());
    data.VestingTokenAddress5 = token.address;
    fs.writeFile('deployed_test.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
    await token.transfer(accounts.holder1, ether('11.11'));
    await token.transfer(accounts.holder6, ether('22.22'));
    await token.transfer(accounts.holder7, ether('33.33'));
    await token.transfer(accounts.holder8, ether('44.44'));
    await token.transfer(accounts.holder9, ether('55.55'));
  }
};
