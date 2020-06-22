const { BN, constants, expectRevert, time } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory');
const VestingToken = artifacts.require('VestingToken');

require('chai')
  .should();

contract('VestingToken', function ([_, controller, ...holders]) {
  const amount = new BN('1000');

  beforeEach(async function () {
    // +1 minute so it starts after contract instantiation
    this.start = (await time.latest()).add(time.duration.minutes(1));
    this.cliffDuration = time.duration.years(1);
    this.duration = time.duration.years(2);
  });

  context('once deployed', function () {
    beforeEach(async function () {
      const tokenFactory = await MiniMeTokenFactory.new({ from: controller });
      this.token = await VestingToken.new(
        tokenFactory.address, ZERO_ADDRESS, 0, 'MiniMe Test Token', 18, 'MMT', true, { from: controller }
      );
    });

    it('can transfer tokens before initiated', async function () {
      await this.token.generateTokens(holders[0], amount, { from: controller });
      await this.token.transfer(holders[1], amount, { from: holders[0] });
      (await this.token.balanceOf(holders[1])).should.be.bignumber.equal(amount);
    });

    it('cannot destory releasable before initiation', async function () {
      await expectRevert(
        this.token.destroyReleasableTokens(holders[0], { from: controller }),
        'VestingToken: cannot execute before initiation'
      );
    });

    it('should be releasable token amount is 0', async function () {
      await this.token.generateTokens(holders[0], amount, { from: controller });
      (await this.token.balanceOf(holders[0])).should.be.bignumber.equal(amount);
      (await this.token.releasableAmount(holders[0], { from: holders[0] }))
        .should.be.bignumber.equal(new BN('0'));
    });

    it('reverts when initiating with not controller', async function () {
      await expectRevert(
        this.token.initiate(this.start, this.cliffDuration, this.duration),
        'Controlled: caller is not the controller'
      );
    });

    it('reverts when initiating with a duration shorter than the cliff', async function () {
      const cliffDuration = this.duration;
      const duration = this.cliffDuration;

      cliffDuration.should.be.bignumber.that.is.at.least(duration);

      await expectRevert(
        this.token.initiate(this.start, cliffDuration, duration, { from: controller }),
        'VestingToken: cliff is longer than duration'
      );
    });

    it('reverts when initiating with a null duration', async function () {
      // cliffDuration should also be 0, since the duration must be larger than the cliff
      await expectRevert(
        this.token.initiate(this.start, 0, 0, { from: controller }),
        'VestingToken: duration is 0'
      );
    });

    it('reverts when initiating if the end time is in the past', async function () {
      const now = await time.latest();

      const start = now.sub(this.duration).sub(time.duration.minutes(1));
      await expectRevert(
        this.token.initiate(start, this.cliffDuration, this.duration, { from: controller }),
        'VestingToken: final time is before current time'
      );
    });

    it('reverts when trying to initiate twice', async function () {
      await this.token.initiate(this.start, this.cliffDuration, this.duration, { from: controller });
      await expectRevert(
        this.token.initiate(this.start, this.cliffDuration, this.duration, { from: controller }),
        'VestingToken: cannot execute after initiation'
      );
    });

    context('after initiated', function () {
      beforeEach(async function () {
        await this.token.initiate(this.start, this.cliffDuration, this.duration, { from: controller });
      });

      it('cannot transfer tokens after initiated', async function () {
        await this.token.generateTokens(holders[0], amount, { from: controller });
        await expectRevert(
          this.token.transfer(holders[1], amount, { from: holders[0] }),
          'MiniMeToken: transfer is not enable'
        );

        await this.token.enableTransfers(true, { from: controller });
        await expectRevert(
          this.token.transfer(holders[1], amount, { from: holders[0] }),
          'VestingToken: cannot execute after initiation'
        );
      });

      it('cannot destory releasable token with not controller', async function () {
        await expectRevert(
          this.token.destroyReleasableTokens(holders[0], { from: holders[0] }),
          'Controlled: caller is not the controller'
        );
      });

      context('with tokens', function () {
        beforeEach(async function () {
          await this.token.generateTokens(holders[0], amount, { from: controller });
        });

        it('cannot be destroy before cliff', async function () {
          await expectRevert(this.token.destroyReleasableTokens(holders[0], { from: controller }),
            'VestingToken: no tokens are due'
          );
        });

        it('should destroy proper amount after cliff', async function () {
          const holderAmount = await this.token.balanceOf(holders[0]);

          await time.increaseTo(this.start.add(this.cliffDuration));
          await this.token.destroyReleasableTokens(holders[0], { from: controller });

          const releaseTime = await time.latest();
          const releasedAmount = amount.mul(releaseTime.sub(this.start)).div(this.duration);

          // releasedAmount value should be holderAmount.divn(2)
          // (because cliffDuration is 1 years and duration is 2 years)
          (await this.token.balanceOf(holders[0])).should.be.bignumber.equal(holderAmount.sub(releasedAmount));
          (await this.token.released(holders[0])).should.be.bignumber.equal(releasedAmount);
        });

        it('should linearly release tokens during vesting period', async function () {
          const vestingPeriod = this.duration.sub(this.cliffDuration);
          const checkpoints = 4;

          for (let i = 1; i <= checkpoints; i++) {
            const now = this.start.add(this.cliffDuration).add((vestingPeriod.muln(i).divn(checkpoints)));
            await time.increaseTo(now);

            await this.token.destroyReleasableTokens(holders[0], { from: controller });

            const willBeDestroyedTokenAmount = amount.mul(now.sub(this.start)).div(this.duration);
            (await this.token.released(holders[0])).should.be.bignumber.equal(willBeDestroyedTokenAmount);
          }
        });

        it('should have released all after end', async function () {
          await time.increaseTo(this.start.add(this.duration));
          await this.token.destroyReleasableTokens(holders[0], { from: controller });

          (await this.token.balanceOf(holders[0])).should.be.bignumber.equal(new BN('0'));
          (await this.token.released(holders[0])).should.be.bignumber.equal(amount);
        });
      });
    });
  });
});
