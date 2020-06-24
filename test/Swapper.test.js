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

contract('Swapper basis', function ([controller, owner, investor, ...others]) {
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
      await Swapper.new(token.address, { from: owner });
    await swapper.updateRate(seedTON.address, seedRate, {from: owner});
    await swapper.updateRate(privateTON.address, privateRate, {from: owner});
    await swapper.updateRate(strategicTON.address, strategicRate, {from: owner});

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
  });

  describe('related with rate', function () {
    it('should be correct rate', async function () {
      (await swapper.rate(seedTON.address)).should.be.bignumber.equal(new BN(seedRate));
      (await swapper.rate(privateTON.address)).should.be.bignumber.equal(new BN(privateRate));
      (await swapper.rate(strategicTON.address)).should.be.bignumber.equal(new BN(strategicRate));
    });
    it('should fail updating rate', async function () {
      await expectRevert(
        swapper.updateRate(seedTON.address, seedRate, {from: others[0]}),
        'Secondary: caller is not the primary account'
      );
    });
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

  describe('related with withdraw', function () {
    it('can withdraw', async function () {
      const before = await token.balanceOf(swapper.address);
      await swapper.withdraw(others[0], before, { from: owner });
      (await token.balanceOf(swapper.address)).should.be.bignumber.equal(new BN('0'));
      (await token.balanceOf(others[0])).should.be.bignumber.equal(before);
    });
    it('cannot withdraw from others', async function () {
      const before = await token.balanceOf(swapper.address);
      await expectRevert(
        swapper.withdraw(others[0], before, { from: others[0] }),
        'Secondary: caller is not the primary account'
      );
      (await token.balanceOf(swapper.address)).should.be.bignumber.equal(before);
      (await token.balanceOf(others[0])).should.be.bignumber.equal(new BN('0'));
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
      (await token.balanceOf(investor)).should.be.bignumber.equal(expectedTransferred);
      (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(new BN('0'));
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
      (await token.balanceOf(investor)).should.be.bignumber.equal(expectedTransferred);
      (await swapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(new BN('0'));
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
      (await token.balanceOf(investor)).should.be.bignumber.equal(expectedTransferred);
      (await swapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(new BN('0'));
    });
    it('cannot swap unregistered token', async function () {
      tempTON = await VestingToken.new(
        ZERO_ADDRESS, ZERO_ADDRESS, 0, 'TEMP TON', 18, 'TTON', true, { from: controller }
      );
      await expectRevert(
        swapper.swap(tempTON.address, { from: investor }),
        "Swapper: not valid sale token address"
      );
    });
    it('should revert releasable amount if transaction fail', async function () {
      await swapper.withdraw(others[0], totalSupply, { from: owner });

      const before = (await swapper.releasableAmount(strategicTON.address, investor));
      await expectRevert(
        swapper.swap(strategicTON.address, { from: investor }),
        'SafeMath: subtraction overflow.'
      );

      (await token.balanceOf(investor)).should.be.bignumber.equal(new BN('0'));
      (await swapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(before);
    });
  });
});
contract('Swapper scenario', function ([controller, owner, investor, ...others]) {
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
      await Swapper.new(token.address, { from: owner });
    await swapper.updateRate(seedTON.address, seedRate, {from: owner});
    await swapper.updateRate(privateTON.address, privateRate, {from: owner});
    await swapper.updateRate(strategicTON.address, strategicRate, {from: owner});

    await seedTON.generateTokens(investor, amount);
    await privateTON.generateTokens(investor, amount);
    await strategicTON.generateTokens(investor, amount);
    await token.mint(swapper.address, totalSupply);

    (await seedTON.initiated()).should.be.equal(false);
    (await privateTON.initiated()).should.be.equal(false);
    (await strategicTON.initiated()).should.be.equal(false);
  });

  describe('before initiation', function () {
    it('should get zero releasable amount', async function () {
      (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(new BN(0));
      (await swapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(new BN(0));
      (await swapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(new BN(0));
    });
    it('cannot initiate by others', async function () {
      start = (await time.latest()).add(time.duration.days(1));
      cliffDuration = time.duration.years(1);
      duration = time.duration.years(2);

      await expectRevert(
        seedTON.initiate(start, cliffDuration, duration, {from: others[0]}),
        "Controlled: caller is not the controller"
      );
      await expectRevert(
        privateTON.initiate(start, cliffDuration, duration, {from: others[0]}),
        "Controlled: caller is not the controller"
      );
      await expectRevert(
        strategicTON.initiate(start, cliffDuration, duration, {from: others[0]}),
        "Controlled: caller is not the controller"
      );
    });
    it('should fail swapping', async function () {
      await expectRevert(
        swapper.swap(seedTON.address, { from: investor }),
        "VestingToken: cannot execute before initiation"
      );
      await expectRevert(
        swapper.swap(privateTON.address, { from: investor }),
        "VestingToken: cannot execute before initiation"
      );
      await expectRevert(
        swapper.swap(strategicTON.address, { from: investor }),
        "VestingToken: cannot execute before initiation"
      );
    });
  });
  describe('after calling initiation, before start', function () {
    beforeEach(async function () {
      start = (await time.latest()).add(time.duration.days(1));
      cliffDuration = time.duration.years(1);
      duration = time.duration.years(2);

      await seedTON.initiate(start, cliffDuration, duration);
      await privateTON.initiate(start, cliffDuration, duration);
      await strategicTON.initiate(start, cliffDuration, duration);

      await seedTON.changeController(swapper.address);
      await privateTON.changeController(swapper.address);
      await strategicTON.changeController(swapper.address);
    });
    it('should get initiated status', async function () {
      (await seedTON.initiated()).should.be.equal(true);
      (await privateTON.initiated()).should.be.equal(true);
      (await strategicTON.initiated()).should.be.equal(true);
    });
    it('should get zero releasable amount', async function () {
      (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(new BN(0));
      (await swapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(new BN(0));
      (await swapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(new BN(0));
    });
    it('should fail swapping', async function () {
      await expectRevert(
        swapper.swap(seedTON.address, { from: investor }),
        "VestingToken: no tokens are due"
      );
      await expectRevert(
        swapper.swap(privateTON.address, { from: investor }),
        "VestingToken: no tokens are due"
      );
      await expectRevert(
        swapper.swap(strategicTON.address, { from: investor }),
        "VestingToken: no tokens are due"
      );
    });
    context('after start, before cliff', function () {
      beforeEach(async function () {
        currentTime = start.add(cliffDuration).sub(time.duration.days(1))
        await time.increaseTo(currentTime);
      });
      it('should get zero releasable amount', async function () {
        (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(new BN(0));
        (await swapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(new BN(0));
        (await swapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(new BN(0));
      });
      it('should fail swapping', async function () {
        await expectRevert(
          swapper.swap(seedTON.address, { from: investor }),
          "VestingToken: no tokens are due"
        );
        await expectRevert(
          swapper.swap(privateTON.address, { from: investor }),
          "VestingToken: no tokens are due"
        );
        await expectRevert(
        swapper.swap(strategicTON.address, { from: investor }),
            "VestingToken: no tokens are due"
        );
      });
      context('after cliff, before end', function () {
        beforeEach(async function () {
          currentTime = currentTime.add(time.duration.days(2));
          await time.increaseTo(currentTime);
        });
        it('can get releasable amount', async function () {
          gotSeedRate = await swapper.rate(seedTON.address);
          gotPrivateRate = await swapper.rate(privateTON.address);
          gotStrategicRate = await swapper.rate(strategicTON.address);

          let lastTime = currentTime;
          let lastValue = new BN(0);
          let i = 0;
          for (; currentTime < start.add(duration);
            currentTime = currentTime.add(time.duration.days(30))) {
            await time.increaseTo(currentTime);
            expected = amount.mul(currentTime.sub(start)).div(duration);
            expected.should.be.bignumber.least(lastValue);
            (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(expected);
            (await swapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(expected);
            (await swapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(expected);
            lastValue = expected;
            i++;
          }
          i.should.be.equal(13);
          await time.increaseTo(currentTime);
          (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(amount);
          (await swapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(amount);
          (await swapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(amount);
        });
        it('can swap', async function () {
          const rate = await swapper.rate(seedTON.address);
          const releasableAmount = await swapper.releasableAmount(seedTON.address, investor);
          const expectedTransferred = releasableAmount.mul(rate);
          //const expectedTransferred = amount.mul(rate);

          const { logs } = await swapper.swap(seedTON.address, { from: investor });

          expectEvent.inLogs(logs, 'Swapped', {
            account: investor,
            unreleased: releasableAmount,
            transferred: expectedTransferred,
          });
          (await token.balanceOf(investor)).should.be.bignumber.equal(expectedTransferred);
          (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(new BN('0'));
        });
        it('cannot swap by others', async function () {
          await expectRevert(
            swapper.swap(seedTON.address, { from: others[0] }),
            "VestingToken: no tokens are due"
          );
        });
        context('after end', function () {
          beforeEach(async function () {
            currentTime = currentTime.add(duration);
            await time.increaseTo(currentTime);
          });
          it('can swap', async function () {
            const rate = await swapper.rate(seedTON.address);
            const expectedTransferred = amount.mul(rate);
            (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(amount);

            const { logs } = await swapper.swap(seedTON.address, { from: investor });

            expectEvent.inLogs(logs, 'Swapped', {
              account: investor,
              unreleased: amount,
              transferred: expectedTransferred,
            });
            (await token.balanceOf(investor)).should.be.bignumber.equal(expectedTransferred);
            (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(new BN('0'));
          });
        });
      });
    });
  });
  describe('after start, zero cliff, before end', function () {
    beforeEach(async function () {
      start = (await time.latest()).add(time.duration.days(1));
      cliffDuration = 0;
      duration = time.duration.years(2);

      await seedTON.initiate(start, cliffDuration, duration);
      await privateTON.initiate(start, cliffDuration, duration);
      await strategicTON.initiate(start, cliffDuration, duration);

      await seedTON.changeController(swapper.address);
      await privateTON.changeController(swapper.address);
      await strategicTON.changeController(swapper.address);

      currentTime = start.add(time.duration.days(1));
      await time.increaseTo(currentTime);
    });
    it('should get initiated status', async function () {
      (await seedTON.initiated()).should.be.equal(true);
      (await privateTON.initiated()).should.be.equal(true);
      (await strategicTON.initiated()).should.be.equal(true);
    });
    it('can get releasable amount', async function () {
      //currentTime = currentTime.add(time.duration.days(2));
      //await time.increaseTo(currentTime);

      gotSeedRate = await swapper.rate(seedTON.address);
      gotPrivateRate = await swapper.rate(privateTON.address);
      gotStrategicRate = await swapper.rate(strategicTON.address);

      let lastTime = currentTime;
      let lastValue = new BN(0);
      let i = 0;
      for (; currentTime < start.add(duration);
        currentTime = currentTime.add(time.duration.days(30))) {
        await time.increaseTo(currentTime);
        expected = amount.mul(currentTime.sub(start)).div(duration);
        expected.should.be.bignumber.least(lastValue);
        (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(expected);
        (await swapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(expected);
        (await swapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(expected);
        lastValue = expected;
        i++;
      }
      i.should.be.equal(25);
      await time.increaseTo(currentTime);
      (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(amount);
      (await swapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(amount);
      (await swapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(amount);
    });
    it('can swap with seed ton', async function () {
      let lastTokenBalance = new BN(0);
      let i = 0;
      const rate = await swapper.rate(seedTON.address);
      for (; currentTime < start.add(duration);
        currentTime = currentTime.add(time.duration.days(30))) {
        await time.increaseTo(currentTime);
        const releasableAmount = await swapper.releasableAmount(seedTON.address, investor);
        const expectedTransferred = releasableAmount.mul(rate);

        const { logs } = await swapper.swap(seedTON.address, { from: investor });

        expectEvent.inLogs(logs, 'Swapped', {
          account: investor,
          unreleased: releasableAmount,
          transferred: expectedTransferred,
        });
        lastTokenBalance = lastTokenBalance.add(expectedTransferred);
        (await token.balanceOf(investor)).should.be.bignumber.equal(lastTokenBalance);
        (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(new BN('0'));
        i++;
      }
      currentTime = currentTime.add(time.duration.days(30));
      await time.increaseTo(currentTime);
      i.should.be.equal(25);
      const releasableAmount = await swapper.releasableAmount(seedTON.address, investor);
      const expectedTransferred = releasableAmount.mul(rate);
      const { logs } = await swapper.swap(seedTON.address, { from: investor });
      expectEvent.inLogs(logs, 'Swapped', {
        account: investor,
        unreleased: releasableAmount,
        transferred: expectedTransferred,
      });
      (await token.balanceOf(investor)).should.be.bignumber.equal(amount.mul(rate));
      (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(new BN('0'));
    });
  });
});
