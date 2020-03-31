const { Payment, ETH, STON, STON_ETH } = require('./index');

const data = [
  // Sample Data
  {
    caption: 'sample data',
    purchaser: '0x1c0a5Dbec8A67490013e96eDbcc18fAcd90dcDa7',
    eth: ETH('600.00000000000'),
    token: STON('9024.000000'),
    rate: STON_ETH('15.040000'),
  },
];

module.exports = data.map(
  ({ purchaser, eth, token, rate, caption }) => new Payment(purchaser, eth, token, rate, caption)
);
