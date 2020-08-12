require('dotenv').config();
const fs = require('fs');
const PrivateKeyProvider = require('truffle-privatekey-provider');
// const pk = fs.readFileSync('.pk').toString().trim();
const pk = 'e3bde35b8acad83113a5f1fe6c9e03611ece8b7f1f9e070dd29f907e66980ffa';

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
      from: '0xF8e1d287C5Cc579dd2A2ceAe6ccf4FbfBe4CA2F5',
    },
    mainnet: {
      provider: () => new PrivateKeyProvider(process.env.MAINNET_PRIVATE_KEY, 'https://mainnet.infura.io/v3/a608d5cd0f1e42109d964abdffe5d8d9'),
      network_id: 1, // eslint-disable-line camelcase
      gasPrice: 180e9,
      skipDryRun: true,
      // production: true,
    },
    coverage: {
      host: 'localhost',
      network_id: '*', // eslint-disable-line camelcase
      port: 8555,
      gas: 0xfffffffffff,
      gasPrice: 0x01,
    },
    rinkeby: {
      provider: new PrivateKeyProvider(pk, 'https://rinkeby.infura.io/v3/a608d5cd0f1e42109d964abdffe5d8d9'),
      network_id: '4', // eslint-disable-line camelcase
      gas: 5000000,
      gasPrice: 20000000000,
      skipDryRun: true,
    },
    // ropsten: {
    //   provider: new PrivateKeyProvider(pk, 'https://ropsten.infura.io/v3/a608d5cd0f1e42109d964abdffe5d8d9'),
    //   network_id: '3', // eslint-disable-line camelcase
    //   gas: 5000000,
    //   gasPrice: 20000000000,
    //   skipDryRun: true,
    // },
  },
  mocha: {
    bail: true,
  },
};
