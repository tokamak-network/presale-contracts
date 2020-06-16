const VestingToken = artifacts.require('VestingToken');
const holders = require('../private_ton_holders.js');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

module.exports = async function (deployer) {
  if (!process.env.PRIVATESALE) return;
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
};
