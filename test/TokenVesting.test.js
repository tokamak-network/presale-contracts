const { BN, constants, expectEvent, expectRevert, time } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const ERC20Mintable = artifacts.require('ERC20Mintable');
const TokenVesting = artifacts.require('TokenVesting');

require('chai')
  .should();

contract('TokenVesting', function ([_, owner, beneficiary]) {
  const amount = new BN('1000');

  beforeEach(async function () {
    // +1 minute so it starts after contract instantiation
    this.start = (await time.latest()).add(time.duration.minutes(1));
    this.cliffDuration = time.duration.years(1);
    this.duration = time.duration.years(2);
  });

  it('reverts when deploying with zero address', async function () {
    await expectRevert(
      TokenVesting.new(ZERO_ADDRESS, { from: owner }),
      'TokenVesting: token is zero address'
    );
  });

  context('once deployed', function () {
    beforeEach(async function () {
      this.token = await ERC20Mintable.new({ from: owner });
      this.vesting = await TokenVesting.new(this.token.address, { from: owner });
    });

    it('can get state', async function () {
      (await this.vesting.initiated()).should.be.equal(false);
      (await this.vesting.vestedToken()).should.be.equal(this.token.address);
    });

    it('reverts when initiating with not primary account', async function () {
      await expectRevert(
        this.vesting.initiate(this.start, this.cliffDuration, this.duration),
        'Secondary: caller is not the primary account'
      );
    });

    it('reverts when trying to initiate twice', async function () {
      await this.vesting.initiate(this.start, this.cliffDuration, this.duration, { from: owner });
      await expectRevert(
        this.vesting.initiate(this.start, this.cliffDuration, this.duration, { from: owner }),
        'TokenVesting: already initiated'
      );
    });

    it('reverts when initiating with a duration shorter than the cliff', async function () {
      const cliffDuration = this.duration;
      const duration = this.cliffDuration;

      cliffDuration.should.be.bignumber.that.is.at.least(duration);

      await expectRevert(
        this.vesting.initiate(this.start, cliffDuration, duration, { from: owner }),
        'TokenVesting: cliff is longer than duration'
      );
    });

    it('reverts when initiating with a null duration', async function () {
      // cliffDuration should also be 0, since the duration must be larger than the cliff
      await expectRevert(
        this.vesting.initiate(this.start, 0, 0, { from: owner }), 'TokenVesting: duration is 0'
      );
    });

    it('reverts when initiating if the end time is in the past', async function () {
      const now = await time.latest();

      const start = now.sub(this.duration).sub(time.duration.minutes(1));
      await expectRevert(
        this.vesting.initiate(start, this.cliffDuration, this.duration, { from: owner }),
        'TokenVesting: final time is before current time'
      );
    });

    it('cannot be released before initiation', async function () {
      await expectRevert(this.vesting.release(beneficiary, { from: owner }),
        'TokenVesting: not yet initiated'
      );
    });

    context('after initiated', function () {
      beforeEach(async function () {
        await this.vesting.initiate(this.start, this.cliffDuration, this.duration, { from: owner });
      });

      it('can get state after initiated', async function () {
        (await this.vesting.cliff()).should.be.bignumber.equal(this.start.add(this.cliffDuration));
        (await this.vesting.start()).should.be.bignumber.equal(this.start);
        (await this.vesting.duration()).should.be.bignumber.equal(this.duration);
      });

      it('reverts with no allowance', async function () {
        await expectRevert(this.vesting.vest(beneficiary, amount, { from: owner }),
          'SafeERC20: low-level call failed'
        );
      });

      it('reverts with less than allowance', async function () {
        await this.token.approve(this.vesting.address, amount.sub(new BN('1')), { from: beneficiary });
        await expectRevert(this.vesting.vest(beneficiary, amount, { from: owner }),
          'SafeERC20: low-level call failed'
        );
      });

      it('reverts when vesting with not primary account', async function () {
        await this.token.mint(owner, amount, { from: owner });
        await this.token.approve(this.vesting.address, amount, { from: beneficiary });

        await expectRevert(
          this.vesting.vest(beneficiary, amount),
          'Secondary: caller is not the primary account'
        );
      });

      it('can vest tokens', async function () {
        await this.token.mint(owner, amount, { from: owner });
        await this.token.approve(this.vesting.address, amount, { from: owner });

        const { logs } = await this.vesting.vest(beneficiary, amount, { from: owner });
        expectEvent.inLogs(logs, 'TokensVested', {
          beneficiary: beneficiary,
          amount: amount,
        });

        (await this.vesting.vested(beneficiary)).should.be.bignumber.equal(amount);
      });

      context('with vested tokens', function () {
        beforeEach(async function () {
          await this.token.mint(owner, amount, { from: owner });
          await this.token.approve(this.vesting.address, amount, { from: owner });
          await this.vesting.vest(beneficiary, amount, { from: owner });
        });

        it('cannot be released with not primary account', async function () {
          await this.token.mint(owner, amount, { from: owner });
          await this.token.approve(this.vesting.address, amount, { from: owner });

          await expectRevert(
            this.vesting.release(beneficiary),
            'Secondary: caller is not the primary account'
          );
          await expectRevert(
            this.vesting.releaseAt(beneficiary, amount),
            'Secondary: caller is not the primary account'
          );
        });

        it('cannot be released with over block timestamp', async function () {
          const timestamp = (await time.latest()).add(time.duration.minutes(1));
          await expectRevert(
            this.vesting.releaseAt(beneficiary, timestamp, { from: owner }),
            'TokenVesting: invalid timestamp'
          );
        });

        it('cannot be released before cliff', async function () {
          await expectRevert(this.vesting.release(beneficiary, { from: owner }),
            'TokenVesting: no tokens are due'
          );
        });

        it('can be released after cliff', async function () {
          await time.increaseTo(this.start.add(this.cliffDuration).add(time.duration.weeks(1)));
          const { logs } = await this.vesting.release(beneficiary, { from: owner });
          expectEvent.inLogs(logs, 'TokensReleased', {
            beneficiary: beneficiary,
            amount: await this.token.balanceOf(beneficiary),
          });
        });

        it('should release proper amount after cliff', async function () {
          await time.increaseTo(this.start.add(this.cliffDuration));

          await this.vesting.release(beneficiary, { from: owner });
          const releaseTime = await time.latest();

          const releasedAmount = amount.mul(releaseTime.sub(this.start)).div(this.duration);
          (await this.token.balanceOf(beneficiary)).should.be.bignumber.equal(releasedAmount);
          (await this.vesting.released(beneficiary)).should.be.bignumber.equal(releasedAmount);
        });

        it('should linearly release tokens during vesting period', async function () {
          const vestingPeriod = this.duration.sub(this.cliffDuration);
          const checkpoints = 4;

          for (let i = 1; i <= checkpoints; i++) {
            const now = this.start.add(this.cliffDuration).add((vestingPeriod.muln(i).divn(checkpoints)));
            await time.increaseTo(now);

            await this.vesting.release(beneficiary, { from: owner });
            const expectedVesting = amount.mul(now.sub(this.start)).div(this.duration);
            (await this.token.balanceOf(beneficiary)).should.be.bignumber.equal(expectedVesting);
            (await this.vesting.released(beneficiary)).should.be.bignumber.equal(expectedVesting);
          }
        });

        it('should have released all after end', async function () {
          await time.increaseTo(this.start.add(this.duration));
          await this.vesting.release(beneficiary, { from: owner });
          (await this.token.balanceOf(beneficiary)).should.be.bignumber.equal(amount);
          (await this.vesting.released(beneficiary)).should.be.bignumber.equal(amount);
        });
      });
    });
  });
});
