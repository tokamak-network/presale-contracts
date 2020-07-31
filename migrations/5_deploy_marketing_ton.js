const MTON = artifacts.require('MTON');
const fs = require('fs');
const { BN, constants, ether } = require('openzeppelin-test-helpers');
const accounts = require('../test_accounts.json');
const parameter = require('../config.js');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const wallet = '0xF8e1d287C5Cc579dd2A2ceAe6ccf4FbfBe4CA2F5';
const decimal = new BN('18');
const totalSupply = ether('224000.1'); // total supply 50,000,000
// 배포된 컨트랙트개수 각 owner계정 및 권한들, 엑셀로 정리

module.exports = async function (deployer) {
  if (process.env.MARKETING) {
    let token;
    await deployer.deploy(MTON).then(async () => { token = await MTON.deployed(); })
      .then(() => token.mint(accounts.owner, ether('30000')));
    const data = JSON.parse(fs.readFileSync('deployed.json').toString());
    data.MarketingTON = (await MTON.deployed()).address;
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
    await token.transfer(accounts.holder1, ether('110.11'), { from: accounts.owner });
    await token.transfer(accounts.holder2, ether('220.22'), { from: accounts.owner });
    await token.transfer(accounts.holder3, ether('330.33'), { from: accounts.owner });
    await token.transfer(accounts.holder4, ether('440.44'), { from: accounts.owner });
    await token.transfer(accounts.holder5, ether('550.55'), { from: accounts.owner });
    await token.transfer(accounts.holder6, ether('110.11'), { from: accounts.owner });
    await token.transfer(accounts.holder7, ether('220.22'), { from: accounts.owner });
    await token.transfer(accounts.holder8, ether('330.33'), { from: accounts.owner });
    await token.transfer(accounts.holder9, ether('440.44'), { from: accounts.owner });
    await token.transfer(accounts.holder10, ether('153.66'), { from: accounts.owner });
    await token.transfer(accounts.holder11, ether('166.99'), { from: accounts.owner });
    await token.transfer(accounts.holder12, ether('199'), { from: accounts.owner });
  }
};
