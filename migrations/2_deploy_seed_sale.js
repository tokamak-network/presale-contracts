require('openzeppelin-test-helpers/configure')({ web3 });

const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory');
const VestingToken = artifacts.require('VestingToken');
const Seedsale = artifacts.require('Seedsale');

const numerator = new BN('100');
const denominator = new BN('3');
const minCap = ether('200');
const cap = ether('900');
const wallet = '0xf35A0c48c970d5abFBC1B33096A83bFc87A4a82E';
const decimal = new BN('18');
const totalSupply = ether('30000');

module.exports = function (deployer) {
  if (!process.env.SEEDSALE) return;

  let seedToken, seedSale;

  deployer.deploy(VestingToken,
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
    .then(() => seedToken.generateTokens(seedSale.address, totalSupply))
    .catch((e) => {
      console.error(e);
      throw e;
    });
};
