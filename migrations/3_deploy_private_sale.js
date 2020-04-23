const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const VestingToken = artifacts.require('VestingToken');
const Privatesale = artifacts.require('Privatesale');

const wallet = '0xf35A0c48c970d5abFBC1B33096A83bFc87A4a82E';
const decimal = new BN('18');
const totalSupply = ether('224000.1');

module.exports = async function (deployer) {
  if (!process.env.PRIVATESALE) return;

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
};
