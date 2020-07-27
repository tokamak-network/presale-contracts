const TONVault = artifacts.require('TONVault');
const TON = artifacts.require('TON');
// const StepSwapper = artifacts.require('StepSwapper');
// const VestingSwapper = artifacts.require('VestingSwapper');
const fs = require('fs');
const { BN, constants, ether } = require('openzeppelin-test-helpers');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const wallet = '0xf35A0c48c970d5abFBC1B33096A83bFc87A4a82E';
const decimal = new BN('18');
const totalSupply = ether('224000.1');

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
    // let swapper = await Swapper.at(data['Swapper']);
    await vault.setApprovalAmount(data.VestingSwapper, ether('10000')); // seed, private, strategic
    await vault.setApprovalAmount(data.StepSwapper, ether('10000'));
    // vesting swapper & simple swapper
    // setApprovalAmount 계산 정교하게
    // stepSwapper need
    // 호출뒤 권한삭제 setApprovalAmount 권한 삭제하기
    // 권한 옮기는것도 배포스크립트에 포함
    // makerdao currency 활용
  }
};
