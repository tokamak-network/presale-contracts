const { Payment, ETH, PTON2, PTON2_ETH } = require('./index');

const data = [
  // Sample Data
  {
    caption: 'sample data',
    purchaser: '0x1c0a5Dbec8A67490013e96eDbcc18fAcd90dcDa7',
    eth: ETH('600.00000000000'),
    token: PTON2('9024.000000'),
    rate: PTON2_ETH('15.040000'),
  },
];

module.exports = data.map(
  ({ purchaser, eth, token, rate, caption }) => new Payment(purchaser, eth, token, rate, caption)
);
