const MTON = artifacts.require('MTON');
const fs = require('fs');
const { BN, constants, ether } = require('openzeppelin-test-helpers');

const accounts = require('../test_accounts.json');
const param = require('./variables.js');

module.exports = async function (deployer) {
  if (process.env.MARKETING) {
    let token;
    await deployer.deploy(MTON).then(async () => { token = await MTON.deployed(); })
      .then(() => token.mint(
        param.marketingTON.parameters.mtonHolder,
        param.marketingTON.parameters.generatedAmount
      ));
    const data = JSON.parse(fs.readFileSync('deployed.json').toString());
    data.MarketingTON = (await MTON.deployed()).address;
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
    // const mton = MTON.at(param.simpleSwapper.parameters.MTONAddress);
    // await mton.generateTokens(
    //   param.marketingTON.parameters.mtonHolder,
    //   param.marketingTON.parameters.generatedAmount
    // );
  }
};
