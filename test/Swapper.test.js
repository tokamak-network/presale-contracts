const { BN, constants, expectEvent, expectRevert, time } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const Swapper = artifacts.require('Swapper');
const TON = artifacts.require('ERC20Mintable');
const VestingToken = artifacts.require('VestingToken');

require('chai')
  .should();

const amount = new BN('1000');

let swapper, token, seedTON, privateTON, strategicTON; // contract instance
let start, cliffDuration, duration;

contract('Swapper', function ([controller, investor, ...others]) {
  beforeEach(async function () {
    seedTON = await VestingToken.new(
      ZERO_ADDRESS, ZERO_ADDRESS, 0, 'SEED TON', 18, 'STON', true, { from: controller }
    );
    privateTON = await VestingToken.new(
      ZERO_ADDRESS, ZERO_ADDRESS, 0, 'PRIVATE TON', 18, 'PTON', true, { from: controller }
    );
    strategicTON = await VestingToken.new(
      ZERO_ADDRESS, ZERO_ADDRESS, 0, 'STRATEGIC TON', 18, 'STTON', true, { from: controller }
    );
    token = await TON.new('Tokamak Network Token', 'TON', 18);
    swapper = await Swapper.new(token.address, seedTON.address, privateTON.address, strategicTON.address);

    await seedTON.generateTokens(investor, amount);
    await privateTON.generateTokens(investor, amount);
    await strategicTON.generateTokens(investor, amount);

    start = (await time.latest()).add(time.duration.minutes(1));
    cliffDuration = time.duration.years(1);
    duration = time.duration.years(2);

    await seedTON.initiate(start, cliffDuration, duration);
    await privateTON.initiate(start, cliffDuration, duration);
    await strategicTON.initiate(start, cliffDuration, duration);
  });

  describe('unrelated with swap', function () {
    it('should be correct rate', async function () {
      (await swapper.rate(seedTON.address)).should.be.bignumber.equal(new BN('1'));
      (await swapper.rate(privateTON.address)).should.be.bignumber.equal(new BN('2'));
      (await swapper.rate(strategicTON.address)).should.be.bignumber.equal(new BN('3'));
    });

    it('can change controller ownership', async function () {
      await seedTON.changeController(swapper.address);
      await privateTON.changeController(swapper.address);
      await strategicTON.changeController(swapper.address);

      await swapper.changeController(seedTON.address, ZERO_ADDRESS);
      await swapper.changeController(privateTON.address, ZERO_ADDRESS);
      await swapper.changeController(strategicTON.address, ZERO_ADDRESS);

      (await seedTON.controller()).should.be.equal(ZERO_ADDRESS);
      (await privateTON.controller()).should.be.equal(ZERO_ADDRESS);
      (await strategicTON.controller()).should.be.equal(ZERO_ADDRESS);
    });
  });

  describe('related with swap', function () {
    beforeEach(async function () {
      await seedTON.changeController(swapper.address);
      await privateTON.changeController(swapper.address);
      await strategicTON.changeController(swapper.address);
      await token.addMinter(swapper.address);

      await time.increaseTo(start.add(duration));
    });

    it('can swap token only with sale token', async function () {
      await expectRevert(
        swapper.swap(ZERO_ADDRESS),
        'Swapper: not valid sale token address'
      );
    });

    it('can swap with seed ton', async function () {
      const rate = await swapper.rate(seedTON.address);
      const expectedMinted = amount.mul(rate);

      const { logs } = await swapper.swap(seedTON.address, { from: investor });

      expectEvent.inLogs(logs, 'Swapped', {
        account: investor,
        unreleased: amount,
        minted: expectedMinted,
      });
    });

    it('can swap with private ton', async function () {
      const rate = await swapper.rate(privateTON.address);
      const expectedMinted = amount.mul(rate);

      const { logs } = await swapper.swap(privateTON.address, { from: investor });

      expectEvent.inLogs(logs, 'Swapped', {
        account: investor,
        unreleased: amount,
        minted: expectedMinted,
      });
    });

    it('can swap with strategic ton', async function () {
      const rate = await swapper.rate(strategicTON.address);
      const expectedMinted = amount.mul(rate);

      const { logs } = await swapper.swap(strategicTON.address, { from: investor });

      expectEvent.inLogs(logs, 'Swapped', {
        account: investor,
        unreleased: amount,
        minted: expectedMinted,
      });
    });
  });
});
