const TONVault = artifacts.require('TONVault');
const TON = artifacts.require('TON');
// const StepSwapper = artifacts.require('StepSwapper');
// const VestingSwapper = artifacts.require('VestingSwapper');
const fs = require('fs');
const { BN, constants, ether } = require('openzeppelin-test-helpers');

const { createCurrency } = require('@makerdao/currency');
const _ETH = createCurrency('ETH');
const _TON = createCurrency('TON');
const UNIT = 'wei';

const seed = 30000;
const private = 144000.083230664748493368;
const strategic = 84000.1;
const ratio = 50;

module.exports = async function (deployer) {
  if (process.env.DAEMONTEST || process.env.SEED || process.env.PRIVATE || process.env.STRATEGIC) {
    let vault;
    const data = JSON.parse(fs.readFileSync('deployed.json').toString());
    await deployer.deploy(TONVault, data.TON).then(async () => { vault = await TONVault.deployed(); });
    data.TONVault = vault.address;
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
    // let ton = await TON.at(data.TON);
    // await ton.transfer(vault.address, ether('10000'));
    // valut 안에 ton 넣어놓고  
    
    const amount = (_ETH(seed).add(_ETH(private)).add(_ETH(strategic))).mul(ratio);

    // let swapper = await Swapper.at(data['Swapper']);
    await vault.setApprovalAmount(data.VestingSwapper, ether(amount._amount.toString())); // seed, private, strategic
    await vault.setApprovalAmount(data.SimpleSwapper, ether('34500000'));
    // vesting swapper & simple swapper
    // setApprovalAmount 계산 정교하게
    // stepSwapper need
    // 호출뒤 권한삭제 setApprovalAmount 권한 삭제하기
    // 권한 옮기는것도 배포스크립트에 포함
    // makerdao currency 활용
  }
};
