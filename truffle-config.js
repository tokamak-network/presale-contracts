require('dotenv').config();
const fs = require('fs');
const PrivateKeyProvider = require('truffle-privatekey-provider');
const pk = fs.readFileSync(".pk").toString().trim();

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // eslint-disable-line camelcase
    },
    development_daemon: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // eslint-disable-line camelcase
      from: '0xDf08F82De32B8d460adbE8D72043E3a7e25A3B39',
    },
    mainnet: {
      provider: () => new PrivateKeyProvider(process.env.MAINNET_PRIVATE_KEY, process.env.MAINNET_JSONRPC),
      network_id: 1, // eslint-disable-line camelcase
      gasPrice: 30e9,
      production: true,
    },
    coverage: {
      host: 'localhost',
      network_id: '*', // eslint-disable-line camelcase
      port: 8555,
      gas: 0xfffffffffff,
      gasPrice: 0x01,
    },
    rinkeby: {
      provider: new PrivateKeyProvider(pk, "https://rinkeby.infura.io/v3/a608d5cd0f1e42109d964abdffe5d8d9"),
      network_id: '4', // eslint-disable-line camelcase
      gas: 5000000,
      gasPrice: 20000000000,
      skipDryRun: true,
    },
    ropsten: {
      provider: new PrivateKeyProvider(pk, "https://ropsten.infura.io/v3/a608d5cd0f1e42109d964abdffe5d8d9"),
      network_id: '3', // eslint-disable-line camelcase
      gas: 5000000,
      gasPrice: 20000000000,
      skipDryRun: true,
    },
  },
  mocha: {
    bail: true,
  },
};
