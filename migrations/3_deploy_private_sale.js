const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const VestingToken = artifacts.require('VestingToken');
const Privatesale = artifacts.require('Privatesale');
const fs = require('fs');
const accounts = require('../test_accounts.json');

const wallet = '0xf35A0c48c970d5abFBC1B33096A83bFc87A4a82E';
const decimal = new BN('18');
const totalSupply = ether('224000.1');

module.exports = async function (deployer) {
  if (process.env.PRIVATESALE) {
    let token, sale;

    deployer.deploy(VestingToken,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      0,
      'Privatesale Tokamak Network Token',
      18,
      'PrivateTON',
      true,
    ).then(async () => { token = await VestingToken.deployed(); })
      .then(() => deployer.deploy(Privatesale,
        wallet,
        token.address,
      ))
      .then(async () => { sale = await Privatesale.deployed(); })
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
      'Privatesale Tokamak Network Token',
      18,
      'PrivateTON',
      true,
    ).then(async () => { token = await VestingToken.deployed(); })
    .then(() => token.generateTokens(accounts['owner'], totalSupply))
    let data = JSON.parse(fs.readFileSync('deployed.json').toString());
    data['VestingTokenAddress2'] = token.address
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
    await token.transfer(accounts['holder1'], ether('11.11'));
    await token.transfer(accounts['holder2'], ether('22.22'));
    await token.transfer(accounts['holder3'], ether('33.33'));
    await token.transfer(accounts['holder4'], ether('44.44'));
    await token.transfer(accounts['holder6'], ether('55.55'));
  }
};
