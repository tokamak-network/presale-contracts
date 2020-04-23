const { BN, constants, ether } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const VestingToken = artifacts.require('VestingToken');
const Private2sale = artifacts.require('Private2sale');

const wallet = '0xf35A0c48c970d5abFBC1B33096A83bFc87A4a82E';
const decimal = new BN('18');
const totalSupply = ether('61000.1');

module.exports = async function (deployer, network, accounts) {
  if (!process.env.PRIVATE2SALE) return;

  console.log('Using network', network, accounts);

  // const token = await deployer.deploy(VestingToken,
  //   ZERO_ADDRESS,
  //   ZERO_ADDRESS,
  //   0,
  //   'Private2 Tokamak Network Token',
  //   decimal,
  //   'Private2TON',
  //   true,
  // );
  const token = await VestingToken.at('0x78BA3F0578dBf80F6E1B2441ca7A361CE2827b26');

  const sale = await deployer.deploy(Private2sale,
    wallet,
    token.address,
  );

  const addrs = {
    token: token.address,
    sale: sale.address,
  };

  console.log('addrs', JSON.stringify(addrs, null, 2));

  console.log('Generating tokens', totalSupply.toString(10));
  await token.generateTokens(sale.address, totalSupply);
};
