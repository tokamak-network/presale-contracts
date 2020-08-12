const TONVault = artifacts.require('TONVault');
const TON = artifacts.require('TON');
const fs = require('fs');
const param = require('./variables.js');

module.exports = async function (deployer) {
  if (process.env.VAULT) {
    // let vault;
    // const data = JSON.parse(fs.readFileSync('deployed.json').toString());
    // await deployer.deploy(
    //   TONVault,
    //   param.simpleSwapper.parameters.TONAddress
    // ).then(async () => {
    //   vault = await TONVault.deployed();
    // });
    // data.TONVault = vault.address;

    // fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
    //   if (err) throw err;
    // });
    const ton = await TON.at(param.simpleSwapper.parameters.TONAddress);
    await ton.mint(
      param.mintTON.parameters.tonVaultAddress,
      param.mintTON.parameters.amountToMint
    );
    const vault = await TONVault.at(param.mintTON.parameters.tonVaultAddress);
    const vestingSwapperAmount = param.vault.parameters.vestingSwapperAmount;
    const simpleSwapperAmount = param.vault.parameters.simpleSwapperAmount;

    await vault.setApprovalAmount(param.vestingSwapper.address, vestingSwapperAmount);
    await vault.setApprovalAmount(param.simpleSwapper.address, simpleSwapperAmount);
  }
};
