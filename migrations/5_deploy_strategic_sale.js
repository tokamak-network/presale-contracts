const { BN, toWei } = require('web3-utils');

const VestingToken = artifacts.require('VestingToken');
const Strategicsale = artifacts.require('Strategicsale');
const fs = require('fs');
const accounts = require('../test_accounts.json');

const ether = n => new BN(toWei(n, 'ether'));

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const wallet = '0xf35A0c48c970d5abFBC1B33096A83bFc87A4a82E';
const totalSupply = ether('84000.1');

module.exports = async function (deployer) {
  if (process.env.STRATEGICSALE) {
    let token, sale;

    deployer.deploy(VestingToken,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      0,
      'Strategic Tokamak Network Token',
      18,
      'StrategicTON',
      true,
    ).then(async () => { token = await VestingToken.deployed(); })
      .then(() => deployer.deploy(Strategicsale,
        wallet,
        token.address,
      ))
      .then(async () => { sale = await Strategicsale.deployed(); })
      .then(() => token.generateTokens(sale.address, totalSupply))
      .catch((e) => {
        console.error(e);
        throw e;
      });
  } else if (process.env.DAEMONTEST) {
    let token;
    await deployer.deploy(VestingToken,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      0,
      'Strategic Tokamak Network Token',
      18,
      'StrategicTON',
      true,
    ).then(async () => { token = await VestingToken.deployed(); })
    .then(() => token.generateTokens(accounts['owner'], totalSupply))
    let data = JSON.parse(fs.readFileSync('deployed.json').toString());
    data['VestingTokenAddress4'] = token.address
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
    await token.transfer(accounts['holder1'], ether('11.11'));
    await token.transfer(accounts['holder2'], ether('22.22'));
    await token.transfer(accounts['holder6'], ether('33.33'));
    await token.transfer(accounts['holder7'], ether('44.44'));
    await token.transfer(accounts['holder8'], ether('55.55'));
  }
};
