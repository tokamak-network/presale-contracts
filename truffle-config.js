const PrivateKeyProvider = require('truffle-privatekey-provider');
require('dotenv').config();

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // eslint-disable-line camelcase
    },
    mainnet: {
      provider: () => {
        console.log('Connecting ' + process.env.MAINNET_JSONRPC);
        return new PrivateKeyProvider(process.env.MAINNET_PRIVATE_KEY, process.env.MAINNET_JSONRPC);
      },
      network_id: 1, // eslint-disable-line camelcase
      gasPrice: 15e9,
      skipDryRun: true,
    },
    coverage: {
      host: 'localhost',
      network_id: '*', // eslint-disable-line camelcase
      port: 8555,
      gas: 0xfffffffffff,
      gasPrice: 0x01,
    },
  },
  mocha: {
    bail: true,
  },
};
