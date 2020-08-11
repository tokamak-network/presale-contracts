const { BN, constants, expectEvent, expectRevert, time } = require('openzeppelin-test-helpers');
const Web3 = require('web3');
const { ZERO_ADDRESS } = constants;

const Swapper = artifacts.require('Swapper');
const TON = artifacts.require('TON');
const MTON = artifacts.require('MTON');
const VestingTokenStep = artifacts.require('VestingTokenStep');
const TONVault = artifacts.require('TONVault');
const Burner = artifacts.require('Burner');

require('chai')
  .should();

const tonTotalSupply = new BN('50000000000000000000000000');
const durationUnitInSeconds = 60 * 60 * 24 * 30;

const presaleFirstClaimDurationInSeconds = new BN('1728000'); // 60*60*24*20
const startTimestamp = 1596931200; // 8/9 9:00
const vestingData = {
  'seed': {
    'totalSupply': new BN('30000000000000000000000'),
    'totalAllocationTon': new BN('1500000000000000000000000'),
    'ratio': new BN('50'),
    'startTimestamp': startTimestamp,
    'cliffDurationInSeconds': 0,
    'firstClaimDurationInSeconds': presaleFirstClaimDurationInSeconds,
    'firstClaimAmountInTon': new BN('15000000000000000000000'),
    'durationInUnit': 6,
  },
  'private': {
    'totalSupply': new BN('144000083230664748493368'),
    'totalAllocationTon': new BN('7200004161533237424668400'),
    'ratio': new BN('50'),
    'startTimestamp': startTimestamp,
    'cliffDurationInSeconds': 0,
    'firstClaimDurationInSeconds': presaleFirstClaimDurationInSeconds,
    'firstClaimAmountInTon': new BN('360000000000000000000000'),
    'durationInUnit': 10,
  },
  'strategic': {
    'totalSupply': new BN('84000100000000000000000'),
    'totalAllocationTon': new BN('4200005000000000000000000'),
    'ratio': new BN('50'),
    'startTimestamp': startTimestamp,
    'cliffDurationInSeconds': 0,
    'firstClaimDurationInSeconds': presaleFirstClaimDurationInSeconds,
    'firstClaimAmountInTon': new BN('378000000000000000000000'),
    'durationInUnit': 10,
  },
  'mton': {
    'totalSupply': new BN('1501834361269942226382433'),
    'totalAllocationTon': new BN('2600005000000000000000000'),
    'ratio': new BN('1'),
    'startTimestamp': startTimestamp,
    'cliffDurationInSeconds': 0,
    'firstClaimDurationInSeconds': presaleFirstClaimDurationInSeconds,
    'firstClaimAmountInTon': new BN('234000000000000000000000'),
    'durationInUnit': 10,
  },
  'team': {
    'totalSupply': new BN('150000000000000000000000'),
    'totalAllocationTon': new BN('7500000000000000000000000'),
    'ratio': new BN('50'),
    'startTimestamp': startTimestamp,
    'cliffDurationInSeconds': 0,
    'cliffDurationInUnit': new BN('5'),
    'firstClaimDurationInSeconds': new BN('0'),
    'firstClaimAmountInTon': new BN('0'),
    'durationInUnit': 36,
  },
};

const expected = {
  'seed': {
  },
  'team': {
  },
};

function generateHoldersInfo (tonName, holderLength) {
  for (let i = 0; i < holderLength; i++) {
    expected[tonName][String(i)] = {};

    // totalVestedAmount
    const totalVestedAmount = new BN(Math.random().toString().slice(2, 24));
    totalVestedAmount.should.be.bignumber.gt(new BN('0'));
    expected[tonName][String(i)].totalVestedAmount = totalVestedAmount;

    // firstClaimAmount
    const firstClaimAmount = new BN('0');
    if (vestingData[tonName].firstClaimAmountInTon.gt(new BN('0'))) {
      const firstClaimAmount = totalVestedAmount.mul(vestingData[tonName].firstClaimAmountInTon.div(new BN(vestingData[tonName].ratio))).div(vestingData[tonName].totalSupply);
      firstClaimAmount.should.be.bignumber.gt(new BN('0'));
    }
    expected[tonName][String(i)].firstClaimAmount = firstClaimAmount;

    // amountInDurationUnit
    const amountInDurationUnit = totalVestedAmount.sub(firstClaimAmount).div(new BN(vestingData[tonName].durationInUnit));
    amountInDurationUnit.should.be.bignumber.gt(new BN('0'));
    expected[tonName][String(i)].amountInDurationUnit = amountInDurationUnit;
  }
}

let swapper, ton, vestingToken; // contract instance
let start, cliffDuration, duration;
let sourceTokens;

contract('Swapper basis', function ([controller, owner, investor, ...others]) {
  beforeEach(async function () {
    vestingToken = await VestingTokenStep.new(
      ZERO_ADDRESS, ZERO_ADDRESS, 0, 'SEED TON', 18, 'STON', true, { from: owner }
    );
    ton = await TON.new({ from: owner });
    const mton = await MTON.new({ from: owner });
    const swapper = await Swapper.new(ton.address, mton.address, { from: owner });
    const vault = await TONVault.new(ton.address, { from: owner });
    const burner = await Burner.new({ from: owner });

    await swapper.setBurner(burner.address, { from: owner });

    await swapper.updateRatio(vestingToken.address, vestingData.team.ratio, { from: owner });

    await vestingToken.generateTokens(owner, vestingData.team.totalSupply, { from: owner });
    await ton.mint(vault.address, tonTotalSupply, { from: owner });

    await vault.setApprovalAmount(swapper.address, tonTotalSupply, { from: owner });
    await swapper.setVault(vault.address, { from: owner });

    // await vestingToken.changeController(swapper.address, {from: owner});

    generateHoldersInfo('team', others.length);

    await vestingToken.transfer(others[0], expected.team['0'].totalVestedAmount, { from: owner });
  });

  describe('before initiation', function () {
    beforeEach(async function () {
    });
    it('releasableAmount - should be zero', async function () {
      (await swapper.releasableAmount(vestingToken.address, others[0])).should.be.bignumber.equal(new BN(0));
    });
  });
  describe('after initiate, before start', function () {
    beforeEach(async function () {
      start = (await time.latest()).add(time.duration.days(1));
      cliffDurationInSeconds = vestingData.team.cliffDurationInUnit.mul(new BN(durationUnitInSeconds));
      firstClaimDurationInSeconds = vestingData.team.firstClaimDurationInSeconds;
      durationInUnits = vestingData.team.durationInUnit;

      await vestingToken.initiate(start, vestingData.team.cliffDurationInUnit, vestingData.team.durationInUnit, { from: owner });
      await vestingToken.changeController(swapper.address, { from: owner });
      await swapper.setStart(start, { from: owner });

      // await vestingToken.approveAndCall(swapper.address, expected["team"]["0"]["totalVestedAmount"], new Uint8Array(0), {from: others[0]});
      await time.increaseTo(start.sub(time.duration.hours(1)));
    });
    describe('updateRatio', function () {
      it('updateRatio - should succeed', async function () {
        await swapper.updateRatio(vestingToken.address, 1234, { from: owner });
      });
      it('updateRatio - should fail from others', async function () {
        await expectRevert(
          swapper.updateRatio(vestingToken.address, 1234, { from: others[0] }),
          'Secondary: caller is not the primary account'
        );
      });
    });
    describe('setBurner', function () {
      it('setBurner - should succeed', async function () {
        await swapper.setBurner(burner.address, { from: owner });
      });
      it('setBurner - should fail from others', async function () {
        await expectRevert(
          swapper.setBurner(burner.address, { from: others[0] }),
          'Secondary: caller is not the primary account'
        );
      });
    });
    it('releasableAmount - should be zero', async function () {
      (await swapper.releasableAmount(vestingToken.address, others[0])).should.be.bignumber.equal(new BN(0));
    });
    it('swap - should get zero', async function () {
      balanceBefore = await ton.balanceOf(others[0]);
      await swapper.swap(vestingToken.address, { from: others[0] });
      balanceAfter = await ton.balanceOf(others[0]);
      balanceBefore.should.be.bignumber.equal(new BN(0));
      balanceAfter.should.be.bignumber.equal(new BN(0));
    });
    describe('after start, before cliff', function () {
      beforeEach(async function () {
        await time.increaseTo(start.add(time.duration.hours(1)));
      });
      it('updateRatio - should revert', async function () {
        await expectRevert(
          swapper.updateRatio(vestingToken.address, 1234, { from: owner }),
          'Swapper: cannot execute after start'
        );
      });
      it('releasableAmount - should be zero', async function () {
        (await swapper.releasableAmount(vestingToken.address, others[0])).should.be.bignumber.equal(new BN(0));
      });
      it('swap - should get zero', async function () {
        balanceBefore = await ton.balanceOf(others[0]);
        await swapper.swap(vestingToken.address, { from: others[0] });
        balanceAfter = await ton.balanceOf(others[0]);
        balanceBefore.should.be.bignumber.equal(new BN(0));
        balanceAfter.should.be.bignumber.equal(new BN(0));
      });
      describe('after cliff, before first claim', function () {
        /* beforeEach(async function () {
          await time.increaseTo(start.add(cliffDurationInSeconds).add(time.duration.hours(1)));
        });
        it('releasableAmount - ', async function () {
          (await swapper.releasableAmount(vestingToken.address, others[0])).should.be.bignumber.equal(expected["team"]["0"]["firstClaimAmount"]);
        });
        it('swap', async function () {
          let balanceBefore = await ton.balanceOf(others[0]);
          await swapper.swap(vestingToken.address, {from: others[0]});
          let balanceAfter = await ton.balanceOf(others[0]);
          balanceAfter.should.be.bignumber.equal(balanceBefore.add(expected["team"]["0"]["firstClaimAmount"].mul(vestingData["team"]["ratio"])));
          //balanceAfter.should.be.bignumber.equal(balanceBefore.add(expectedAmount["ton"]["firstClaimEachAmount"][0]));
        });
        it('test after the first swap', async function () {
          await swapper.swap(vestingToken.address, {from: others[0]});
          await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.hours(1)));
          (await swapper.releasableAmount(vestingToken.address, others[0])).should.be.bignumber.equal(expected["team"]["0"]["amountInDurationUnit"]);
        }); */
        describe('after first claim, before end', function () {
          beforeEach(async function () {
            await time.increaseTo(start.add(cliffDurationInSeconds).add(firstClaimDurationInSeconds).add(time.duration.hours(1)));
          });
          it('releasable amount', async function () {
            (await swapper.releasableAmount(vestingToken.address, others[0])).should.be.bignumber.equal(expected.team['0'].firstClaimAmount.add(expected.team['0'].amountInDurationUnit));
          });
          it('monthly releasable amount', async function () {
            for (i = 0; i < durationInUnits - 1; i++) {
              const currentTime = start.add(cliffDurationInSeconds).add(firstClaimDurationInSeconds).add(time.duration.days(30 * i)).add(time.duration.hours(1));
              await time.increaseTo(currentTime);
              const currentUnit = currentTime.sub(start.add(cliffDurationInSeconds)).div(new BN(durationUnitInSeconds)).add(new BN('1'));
              (await swapper.releasableAmount(vestingToken.address, others[0])).should.be.bignumber.equal(
                expected.team['0'].firstClaimAmount.add(expected.team['0'].totalVestedAmount.mul(currentUnit).div(new BN(vestingData.team.durationInUnit))));
            }

            /* let i = 0;
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * i)).add(time.duration.hours(1)));
            (await swapper.releasableAmount(vestingToken.address, others[0])).should.be.bignumber.equal(
              expected["team"]["0"]["firstClaimAmount"].add(expected["team"]["0"]["amountInDurationUnit"].mul((new BN(i+1)))));

            i = 1;
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * i)).add(time.duration.hours(1)));
            (await swapper.releasableAmount(vestingToken.address, others[0])).should.be.bignumber.equal(
              expected["team"]["0"]["firstClaimAmount"].add(expected["team"]["0"]["amountInDurationUnit"].mul((new BN(i+1)))));

            i = 2;
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * i)).add(time.duration.hours(1)));
            (await swapper.releasableAmount(vestingToken.address, others[0])).should.be.bignumber.equal(
              expected["team"]["0"]["firstClaimAmount"].add(expected["team"]["0"]["amountInDurationUnit"].mul((new BN(i+1))))); */
          });
          it('swap', async function () {
            const balanceBefore = await ton.balanceOf(others[0]);
            await swapper.swap(vestingToken.address, { from: others[0] });
            const balanceAfter = await ton.balanceOf(others[0]);
            balanceAfter.should.be.bignumber.equal(balanceBefore.add((expected.team['0'].firstClaimAmount.add(expected.team['0'].amountInDurationUnit).mul(vestingData.team.ratio))));
          });
          it('monthly swap token', async function () {
            const balanceBefore = await ton.balanceOf(others[0]);
            await swapper.swap(vestingToken.address, { from: others[0] });
            const balanceAfter = await ton.balanceOf(others[0]);
            balanceAfter.should.be.bignumber.equal(balanceBefore.add((expected.team['0'].firstClaimAmount.add(expected.team['0'].amountInDurationUnit).mul(vestingData.team.ratio))));
            await time.increaseTo(start.add(cliffDurationInSeconds).add(firstClaimDurationInSeconds).add(time.duration.days(30 * 1)).add(time.duration.hours(1)));

            const initTonAmount = await ton.balanceOf(others[0]);
            for (i = 0; i < durationInUnits - 1; i++) {
              const balanceBefore = await ton.balanceOf(others[0]);
              await swapper.swap(vestingToken.address, { from: others[0] });
              const balanceAfter = await ton.balanceOf(others[0]);
              balanceAfter.should.be.bignumber.not.lt(balanceBefore.add(expected.team['0'].amountInDurationUnit.mul(vestingData.team.ratio)));
              await time.increaseTo(start.add(cliffDurationInSeconds).add(firstClaimDurationInSeconds).add(time.duration.days(30 * (i + 2))).add(time.duration.hours(2)));
            }
            await swapper.swap(vestingToken.address, { from: others[0] });
            (await ton.balanceOf(others[0])).should.be.bignumber.equal(expected.team['0'].totalVestedAmount.mul(vestingData.team.ratio));

            /* let i = 0;
            balanceBefore = await ton.balanceOf(others[0]);
            vestingTokenBalanceBefore = await vestingToken.balanceOf(others[0]);
            await swapper.swap(vestingToken.address, {from: others[0]});
            balanceAfter = await ton.balanceOf(others[0]);
            vestingTokenBalanceAfter = await vestingToken.balanceOf(others[0]);
            balanceAfter.should.be.bignumber.equal(balanceBefore.add(expected["team"]["0"]["amountInDurationUnit"].mul(vestingData["team"]["ratio"])));
            vestingTokenBalanceAfter.should.be.bignumber.lt(vestingTokenBalanceBefore);
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * (i+2))).add(time.duration.hours(2)));

            i = 1;
            balanceBefore = await ton.balanceOf(others[0]);
            await swapper.swap(vestingToken.address, {from: others[0]});
            balanceAfter = await ton.balanceOf(others[0]);
            balanceAfter.should.be.bignumber.equal(balanceBefore.add(expected["team"]["0"]["amountInDurationUnit"].mul(vestingData["team"]["ratio"])));
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * (i+2))).add(time.duration.hours(2)));

            i = 2;
            balanceBefore = await ton.balanceOf(others[0]);
            await swapper.swap(vestingToken.address, {from: others[0]});
            balanceAfter = await ton.balanceOf(others[0]);
            balanceAfter.should.be.bignumber.equal(balanceBefore.add(expected["team"]["0"]["amountInDurationUnit"].mul(vestingData["team"]["ratio"])));
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * (i+2))).add(time.duration.hours(2)));

            i = 3;
            balanceBefore = await ton.balanceOf(others[0]);
            await swapper.swap(vestingToken.address, {from: others[0]});
            balanceAfter = await ton.balanceOf(others[0]);
            balanceAfter.should.be.bignumber.equal(balanceBefore.add(expected["team"]["0"]["amountInDurationUnit"].mul(vestingData["team"]["ratio"])));
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * (i+2))).add(time.duration.hours(2)));

            i = 4;
            balanceBefore = await ton.balanceOf(others[0]);
            await swapper.swap(vestingToken.address, {from: others[0]});
            balanceAfter = await ton.balanceOf(others[0]);
            balanceAfter.should.be.bignumber.equal(balanceBefore.add(expected["team"]["0"]["amountInDurationUnit"].mul(vestingData["team"]["ratio"])));
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * (i+2))).add(time.duration.hours(2))); */
          });
          describe('after end', function () {
            beforeEach(async function () {
              await time.increaseTo(start.add(cliffDurationInSeconds).add(firstClaimDurationInSeconds).add(time.duration.seconds(durationUnitInSeconds * durationInUnits)).add(time.duration.hours(1)));
            });
            it('releasable amount', async function () {
              (await swapper.releasableAmount(vestingToken.address, others[0])).should.be.bignumber.equal(expected.team['0'].totalVestedAmount);
            });
            it('swap', async function () {
              (await vestingToken.balanceOf(others[0])).should.be.bignumber.not.lt(expected.team['0'].totalVestedAmount);
              const balanceBefore = await ton.balanceOf(others[0]);
              await swapper.swap(vestingToken.address, { from: others[0] });
              const balanceAfter = await ton.balanceOf(others[0]);
              balanceAfter.should.be.bignumber.equal(balanceBefore.add(expected.team['0'].totalVestedAmount.mul(vestingData.team.ratio)));
            });
          });
        });
      });
    });
  });
});
