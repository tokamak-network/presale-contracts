const TONVault = artifacts.require('TONVault');
const TON = artifacts.require('TON');
const Burner = artifacts.require('Burner');
// const StepSwapper = artifacts.require('StepSwapper');
// const VestingSwapper = artifacts.require('VestingSwapper');
const fs = require('fs');
const { BN, constants, ether } = require('openzeppelin-test-helpers');

const { createCurrency } = require('@makerdao/currency');
const _ETH = createCurrency('ETH');
const _TON = createCurrency('TON');
const UNIT = 'wei';
const parameter = require('./variables.js');

// const seed = '30000';
// const private = '144000.083230664748493368';
// const strategic = '84000.1';
// const marketing = '260000'
const ratio = '50';

module.exports = async function (deployer) {
  if (process.env.VAULT) {
    let vault, burner;
    const data = JSON.parse(fs.readFileSync('deployed.json').toString());
    await deployer.deploy(TONVault, data.TON).then(async () => { vault = await TONVault.deployed(); });
    data.TONVault = vault.address;
    await deployer.deploy(Burner).then(async () => { burner = await Burner.deployed(); });
    data.Burner = burner.address;
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });

    const vestingSwapperAmount = parameter.vault.parameters.vestingSwapperAmount;
    const simpleSwapperAmount = parameter.vault.parameters.simpleSwapper;

    await vault.setApprovalAmount(parameter.vestingSwapper.address, vestingSwapperAmount); // seed, private, strategic
    await vault.setApprovalAmount(parameter.simpleSwapper.address, simpleSwapperAmount); // 3450000
  }
};
