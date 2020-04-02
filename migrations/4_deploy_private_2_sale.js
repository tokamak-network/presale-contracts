const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const VestingToken = artifacts.require('VestingToken');
const Private2sale = artifacts.require('Private2sale');

const wallet = '0xf35A0c48c970d5abFBC1B33096A83bFc87A4a82E';
const decimal = new BN('18');
const totalSupply = ether('61000.1');

module.exports = function (deployer) {
  if (!process.env.PRIVATE2SALE) return;

  let token, sale;

  deployer.deploy(VestingToken,
    ZERO_ADDRESS,
    ZERO_ADDRESS,
    0,
    'Private2 Tokamak Network Token',
    decimal,
    'Private2TON',
    true,
  ).then(async () => { token = await VestingToken.deployed(); })
    .then(() => deployer.deploy(Private2sale,
      wallet,
      token.address,
    ))
    .then(async () => { sale = await Private2sale.deployed(); })
    .then(() => token.generateTokens(sale.address, totalSupply))
    .catch((e) => {
      console.error(e);
      throw e;
    });
};
