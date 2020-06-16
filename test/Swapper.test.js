const { BN, constants, expectEvent, expectRevert, time } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const Swapper = artifacts.require('Swapper');
const TON = artifacts.require('ERC20Mintable');
const VestingToken = artifacts.require('VestingToken');

require('chai')
  .should();

const amount = new BN('1000');
const totalSupply = amount.mul(new BN('100'));

const seedRate = new BN('1');
const privateRate = new BN('2');
const strategicRate = new BN('3');

let swapper, token, seedTON, privateTON, strategicTON; // contract instance
let start, cliffDuration, duration;

contract('Swapper', function ([controller, owner, investor, ...others]) {
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
    token = await TON.new('Tokamak Network Token', 'TON', 18, { from: owner });
    swapper =
      await Swapper.new(token.address, seedTON.address, privateTON.address, strategicTON.address, { from: owner });

    await seedTON.generateTokens(investor, amount);
    await privateTON.generateTokens(investor, amount);
    await strategicTON.generateTokens(investor, amount);
    await token.mint(swapper.address, totalSupply);

    start = (await time.latest()).add(time.duration.minutes(1));
    cliffDuration = time.duration.years(1);
    duration = time.duration.years(2);

    await seedTON.initiate(start, cliffDuration, duration);
    await privateTON.initiate(start, cliffDuration, duration);
    await strategicTON.initiate(start, cliffDuration, duration);

    await seedTON.changeController(swapper.address);
    await privateTON.changeController(swapper.address);
    await strategicTON.changeController(swapper.address);

    await time.increaseTo(start.add(cliffDuration));
  });

  describe('unrelated with swap', function () {
    it('should be correct rate', async function () {
      (await swapper.rate(seedTON.address)).should.be.bignumber.equal(seedRate);
      (await swapper.rate(privateTON.address)).should.be.bignumber.equal(privateRate);
      (await swapper.rate(strategicTON.address)).should.be.bignumber.equal(strategicRate);
    });

    it('cannot change controller with no ownership', async function () {
      await expectRevert(
        swapper.changeController(seedTON.address, ZERO_ADDRESS, { from: others[0] }),
        'Secondary: caller is not the primary account'
      );
      await expectRevert(
        swapper.changeController(privateTON.address, ZERO_ADDRESS, { from: others[0] }),
        'Secondary: caller is not the primary account'
      );
      await expectRevert(
        swapper.changeController(strategicTON.address, ZERO_ADDRESS, { from: others[0] }),
        'Secondary: caller is not the primary account'
      );
    });

    it('can change controller with ownership', async function () {
      await swapper.changeController(seedTON.address, ZERO_ADDRESS, { from: owner });
      await swapper.changeController(privateTON.address, ZERO_ADDRESS, { from: owner });
      await swapper.changeController(strategicTON.address, ZERO_ADDRESS, { from: owner });

      (await seedTON.controller()).should.be.equal(ZERO_ADDRESS);
      (await privateTON.controller()).should.be.equal(ZERO_ADDRESS);
      (await strategicTON.controller()).should.be.equal(ZERO_ADDRESS);
    });
  });

  describe('related with swap', function () {
    beforeEach(async function () {
      await time.increaseTo(start.add(duration));
    });

    it('can get releasable amount', async function () {
      (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(amount);
      (await swapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(amount);
      (await swapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(amount);
    });

    it('can swap token only with sale token', async function () {
      await expectRevert(
        swapper.swap(ZERO_ADDRESS),
        'Swapper: not valid sale token address'
      );
    });

    it('can swap with seed ton', async function () {
      const rate = await swapper.rate(seedTON.address);
      const expectedTransferred = amount.mul(rate);

      const { logs } = await swapper.swap(seedTON.address, { from: investor });

      expectEvent.inLogs(logs, 'Swapped', {
        account: investor,
        unreleased: amount,
        transferred: expectedTransferred,
      });
    });

    it('can swap with private ton', async function () {
      const rate = await swapper.rate(privateTON.address);
      const expectedTransferred = amount.mul(rate);

      const { logs } = await swapper.swap(privateTON.address, { from: investor });

      expectEvent.inLogs(logs, 'Swapped', {
        account: investor,
        unreleased: amount,
        transferred: expectedTransferred,
      });
    });

    it('can swap with strategic ton', async function () {
      const rate = await swapper.rate(strategicTON.address);
      const expectedTransferred = amount.mul(rate);

      const { logs } = await swapper.swap(strategicTON.address, { from: investor });

      expectEvent.inLogs(logs, 'Swapped', {
        account: investor,
        unreleased: amount,
        transferred: expectedTransferred,
      });
    });
  });
});
