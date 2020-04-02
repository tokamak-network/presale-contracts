const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const VestingToken = artifacts.require('VestingToken');
const Strategicsale = artifacts.require('Strategicsale');

const wallet = '0xf35A0c48c970d5abFBC1B33096A83bFc87A4a82E';
const decimal = new BN('18');
const totalSupply = ether('20000.1');

module.exports = function (deployer) {
  if (!process.env.STRATEGICSALE) return;

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
};
