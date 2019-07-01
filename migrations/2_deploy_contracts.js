require('openzeppelin-test-helpers/configure')({ web3 });

const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory');
const MiniMeToken = artifacts.require('MiniMeToken');
const Seedsale = artifacts.require('Seedsale');

const numerator = new BN('100');
const denominator = new BN('3');
const cap = ether('900');
const wallet = '0x1F13719AA52cF446327890D274eA4AF934a24510'; // temporary account
const decimal = new BN('18');
const totalSupply = new BN('10').pow(decimal).mul(new BN('30000'));

module.exports = function (deployer, network, accounts) {
  // contract instance
  let tokenFactory, token, seedsale;

  deployer.deploy(MiniMeTokenFactory)
    .then(async () => {
      tokenFactory = await MiniMeTokenFactory.deployed();
    })
    .then(async () => deployer.deploy(MiniMeToken,
      tokenFactory.address,
      ZERO_ADDRESS,
      0,
      'Seedsale Tokamak Network Token',
      18,
      'SeedTON',
      true,
    ))
    .then(async () => {
      token = await MiniMeToken.deployed();
    })
    .then(async () => deployer.deploy(Seedsale,
      numerator,
      denominator,
      wallet,
      token.address,
      cap,
    ))
    .then(async () => {
      seedsale = await Seedsale.deployed();
    })
    .then(async () => {
      await token.generateTokens(seedsale.address, totalSupply);
    })
    .catch(async () => {});
};
