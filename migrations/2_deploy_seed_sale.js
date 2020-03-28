require('openzeppelin-test-helpers/configure')({ web3 });

const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const VestingToken = artifacts.require('VestingToken');
const Seedsale = artifacts.require('Seedsale');
const Privatesale = artifacts.require('Privatesale');

const numerator = new BN('100');
const denominator = new BN('3');
const minCap = ether('200');
const cap = ether('900');
const wallet = '0xf35A0c48c970d5abFBC1B33096A83bFc87A4a82E';
const decimal = new BN('18');

const STONTotalSupply = ether('30000');
const PTONTotalSupply = ether('224000.5');

module.exports = async function (deployer) {
  if (process.env.SEEDSALE) {
    await deployer.deploy(VestingToken,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      0,
      'Seedsale Tokamak Network Token',
      18,
      'SeedTON',
      true,
    );

    const seedToken = await VestingToken.deployed();

    await deployer.deploy(Seedsale,
      numerator,
      denominator,
      wallet,
      seedToken.address,
      cap,
      minCap,
    );

    const seedSale = await Seedsale.deployed();

    await seedToken.generateTokens(seedSale.address, STONTotalSupply);
  }

  if (process.env.PRIVATESALE) {
    await deployer.deploy(VestingToken,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      0,
      'Privatesale Tokamak Network Token',
      18,
      'PrivateTON',
      true,
    );

    const privateToken = await VestingToken.deployed();

    await deployer.deploy(Privatesale,
      wallet,
      privateToken.address,
    );

    const privateSale = await Privatesale.deployed();

    await privateToken.generateTokens(privateSale.address, PTONTotalSupply);
  }
};
