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
const parameter = require('../config.js');

const seed = '30000';
const private = '144000.083230664748493368';
const strategic = '84000.1';
const marketing = '260000'
const ratio = '50';

module.exports = async function (deployer) {
  if (process.env.VAULT) {
    let vault;
    const data = JSON.parse(fs.readFileSync('deployed.json').toString());
    await deployer.deploy(TONVault, data.TON).then(async () => { vault = await TONVault.deployed(); });
    data.TONVault = vault.address;
    await deployer.deploy(Burner).then(async () => { burner = await Burner.deployed(); });
    data.Burner = burner.address;
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
    let ton = await TON.at(data.TON);
    const transferAmount = parameter.tonTotalSupply.sub(parameter.dao.totalAllocationTon)
    await ton.transfer(vault.address, transferAmount);
    // valut 안에 ton 넣어놓고  
    
    const amount = parameter.seed.totalAllocationTon.add(parameter.private.totalAllocationTon).add(parameter.strategic.totalAllocationTon)
    console.log(amount);
    
    await vault.setApprovalAmount(data.VestingSwapper, amount); // seed, private, strategic
    await vault.setApprovalAmount(data.SimpleSwapper, transferAmount.sub(amount).sub(parameter.dao.totalAllocationTon)); // 3450000
    // vesting swapper & simple swapper
    // setApprovalAmount 계산 정교하게
    // stepSwapper need
    // 호출뒤 권한삭제 setApprovalAmount 권한 삭제하기
    // 권한 옮기는것도 배포스크립트에 포함
    // makerdao currency 활용
  }
};
