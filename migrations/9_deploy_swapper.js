const VestingSwapper = artifacts.require('VestingSwapper');
const Burner = artifacts.require('Burner');
const TON = artifacts.require('TON');
const fs = require('fs');
const { BN, constants, ether } = require('openzeppelin-test-helpers');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const wallet = '0xf35A0c48c970d5abFBC1B33096A83bFc87A4a82E';
const decimal = new BN('18');
const totalSupply = ether('224000.1');


module.exports = async function (deployer) {
  if (process.env.DAEMONTEST || process.env.SEEDSALE || process.env.PRIVATESALE || process.env.STRATEGICSALE) {
    let swapper, burner;
    let data = JSON.parse(fs.readFileSync('deployed_test.json').toString());
    await deployer.deploy(Burner).then(async () => { burner = await Burner.deployed(); })
    await deployer.deploy(VestingSwapper, data['TON']).then(async () => { swapper = await VestingSwapper.deployed(); }).then(async () => { swapper.setBurner(burner.address); });
    data['VestingSwapper'] = swapper.address
    fs.writeFile('deployed_test.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
    //let ton = await TON.at(data['TON']);
    //await ton.transfer(swapper.address, ether('10000'));
  }
};
