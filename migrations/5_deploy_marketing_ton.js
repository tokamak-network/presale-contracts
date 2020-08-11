const MTON = artifacts.require('MTON');
const data = require('./variables.js');

module.exports = async function () {
  if (process.env.MARKETING) {
    const mton = MTON.at(data.simpleSwapper.parameters.MTONAddress);
    await mton.generateTokens(
      data.marketingTON.parameters.mtonHolder,
      data.marketingTON.parameters.generatedAmount
    );
  }
};
