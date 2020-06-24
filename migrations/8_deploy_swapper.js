const Swapper = artifacts.require('Swapper');
const TON = artifacts.require('TON');
const fs = require('fs');
const { BN, constants, ether } = require('openzeppelin-test-helpers');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const wallet = '0xf35A0c48c970d5abFBC1B33096A83bFc87A4a82E';
const decimal = new BN('18');
const totalSupply = ether('224000.1');


module.exports = async function (deployer) {
  if (process.env.DAEMONTEST) {
    let swapper;
    let data = JSON.parse(fs.readFileSync('deployed.json').toString());
    await deployer.deploy(Swapper, data['TON']).then(async () => { swapper = await Swapper.deployed(); })
    data['Swapper'] = swapper.address
    fs.writeFile('deployed.json', JSON.stringify(data), (err) => {
      if (err) throw err;
    });
    let ton = await TON.at(data['TON']);
    await ton.transfer(swapper.address, ether('10000'));
  }
};
