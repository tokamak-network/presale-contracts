const TON = artifacts.require('MTON');
const fs = require('fs');
const { BN, constants, ether } = require('openzeppelin-test-helpers');
const accounts = require('../test_accounts.json');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const wallet = '0xF8e1d287C5Cc579dd2A2ceAe6ccf4FbfBe4CA2F5';
const decimal = new BN('18');
const totalSupply = ether('224000.1'); // total supply 50,000,000
// 배포된 컨트랙트개수 각 owner계정 및 권한들, 엑셀로 정리

module.exports = async function (deployer) {
  if (process.env.MARKETING) {
    let token;
    await deployer.deploy(TON).then(async () => { token = await TON.deployed(); })
      .then(() => token.mint(accounts.owner, ether('2600000')));
    const data = JSON.parse(fs.readFileSync('deployed.json').toString());
    data.marketingTON = (await marketingTON.deployed()).address;
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
    await token.transfer(accounts.holder1, ether('1100.11'), { from: accounts.owner });
    await token.transfer(accounts.holder2, ether('2200.22'), { from: accounts.owner });
    await token.transfer(accounts.holder3, ether('3300.33'), { from: accounts.owner });
    await token.transfer(accounts.holder4, ether('4400.44'), { from: accounts.owner });
    await token.transfer(accounts.holder5, ether('5500.55'), { from: accounts.owner });
    await token.transfer(accounts.holder6, ether('1100.11'), { from: accounts.owner });
    await token.transfer(accounts.holder7, ether('2200.22'), { from: accounts.owner });
    await token.transfer(accounts.holder8, ether('3300.33'), { from: accounts.owner });
    await token.transfer(accounts.holder9, ether('4400.44'), { from: accounts.owner });
  }
};
