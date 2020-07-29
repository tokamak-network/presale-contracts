const { BN, constants, expectEvent, expectRevert, time } = require('openzeppelin-test-helpers');
const Web3 = require('web3');
const { ZERO_ADDRESS } = constants;

const VestingSwapper = artifacts.require('VestingSwapper');
const Swapper = artifacts.require('Swapper');
const TON = artifacts.require('TON');
const MTON = artifacts.require('MTON');
const VestingToken = artifacts.require('VestingToken');
const TONVault = artifacts.require('TONVault');
const Burner = artifacts.require('Burner');

require('chai')
  .should();

const amount = new BN('50000000');
const totalSupply = amount.mul(new BN('1000000000000000000'));

/* test data
ratio   10      20      30    
        seed    private strategic   expected ton
total   10000   20000   30000       1400000

case1:
first   100     150     200         10000
1       990     1985    2980        139000
2       990     1985    2980        139000
3       990     1985    2980        139000
4       990     1985    2980        139000
5       990     1985    2980        139000
6       990     1985    2980        139000
7       990     1985    2980        139000
8       990     1985    2980        139000
9       990     1985    2980        139000
10      990     1985    2980        139000

case2:
first   0       0       0           0
1       1000    2000    3000        140000
2       1000    2000    3000        140000
3       1000    2000    3000        140000
4       1000    2000    3000        140000
5       1000    2000    3000        140000
6       1000    2000    3000        140000
7       1000    2000    3000        140000
8       1000    2000    3000        140000
9       1000    2000    3000        140000
10      1000    2000    3000        140000

MTON:
first   100
1       990
2       990
3       990
4       990
5       990
6       990
7       990
8       990
9       990
10      990
*/

//const seedAmount = new BN('10000');
//const privateAmount = new BN('20000');
//const strategicAmount = new BN('30000');
const mtonAmount = new BN('10000');

//const seedRatio = new BN('10');
//const privateRatio = new BN('20');
//const strategicRatio = new BN('30');
const mtonRatio = new BN('1');
//const ratios = [seedRatio, privateRatio, strategicRatio];
const durationUnitInSeconds = 60*60*24*30;

const expectedAmount = {
    // releasable amount
    "seed": {
        "firstClaim": new BN('100'),
        "inUnit": new BN('990')
    },
    "private": {
        "firstClaim": new BN('150'),
        "inUnit": new BN('1985')
    },
    "strategic": {
        "firstClaim": new BN('200'),
        "inUnit": new BN('2980')
    },
    // after all source tokens swapped
    "ton": {
        "firstClaimEachAmount": [new BN('1000'), new BN('3000'), new BN('6000')],
        "firstClaimTotal": new BN('10000'),
        "inUnitEachAmount": [new BN('9900'), new BN('39700'), new BN('89400')],
        "inUnitTotal": new BN('139000'),
    },
};
const expectedMtonAmount = {
    "mton": {
        "firstClaim": new BN('100'),
        "inUnit": new BN('990')
    },
    // after all source tokens swapped
    "ton": {
        "firstClaimEachAmount": [new BN('100')],
        "firstClaimTotal": new BN('100'),
        "inUnitEachAmount": [new BN('990')],
        "inUnitTotal": new BN('990'),
    },
}

const expectedAmount_noFirstClaim = {
    // releasable amount
    "seed": {
        "firstClaim": new BN('0'),
        "inUnit": new BN('1000')
    },
    "private": {
        "firstClaim": new BN('0'),
        "inUnit": new BN('2000')
    },
    "strategic": {
        "firstClaim": new BN('0'),
        "inUnit": new BN('3000')
    },
    // after all source tokens swapped
    "ton": {
        "firstClaimEachAmount": [new BN('0'), new BN('0'), new BN('0')],
        "firstClaimTotal": new BN('0'),
        "inUnitEachAmount": [new BN('10000'), new BN('40000'), new BN('90000')],
        "inUnitTotal": new BN('140000'),
    },
};

const presaleFirstClaimDurationInSeconds = new BN("1728000"); // 60*60*24*20
const startTimestamp = 1596931200; // 8/9 9:00
let vestingData = {
  "seed": {
    "totalSupply": new BN("30000000000000000000000"),
    "totalAllocationTon": new BN("1500000000000000000000000"),
    "ratio": new BN("50"),
    "startTimestamp": startTimestamp, 
    "cliffDurationInSeconds": 0,
    "firstClaimDurationInSeconds": presaleFirstClaimDurationInSeconds, 
    "firstClaimAmountInTon": new BN("15000000000000000000000"), 
    "durationInUnit": 6
  },
  "private": {
    "totalSupply": new BN("144000083230664748493368"),
    "totalAllocationTon": new BN("7200004161533237424668400"),
    "ratio": new BN("50"),
    "startTimestamp": startTimestamp, 
    "cliffDurationInSeconds": 0,
    "firstClaimDurationInSeconds": presaleFirstClaimDurationInSeconds, 
    "firstClaimAmountInTon": new BN("360000000000000000000000"), 
    "durationInUnit": 10
  },
  "strategic": {
    "totalSupply": new BN("84000100000000000000000"),
    "totalAllocationTon": new BN("4200005000000000000000000"),
    "ratio": new BN("50"),
    "startTimestamp": startTimestamp, 
    "cliffDurationInSeconds": 0,
    "firstClaimDurationInSeconds": presaleFirstClaimDurationInSeconds, 
    "firstClaimAmountInTon": new BN("378000000000000000000000"), 
    "durationInUnit": 10
  },
  "mton": {
    //"totalSupply": new BN("2600000000000000000000000"),
    "totalSupply": new BN("1501834361269942226382433"),
    "totalAllocationTon": new BN("2600000000000000000000000"),
    "ratio": new BN("1"),
    "startTimestamp": startTimestamp, 
    "cliffDurationInSeconds": 0,
    "firstClaimDurationInSeconds": presaleFirstClaimDurationInSeconds, 
    "firstClaimAmountInTon": new BN("234000000000000000000000"), 
    "durationInUnit": 10
  },
}

let expected = {
  "seed": {
  },
  "mton": {
  },
}

function generateHoldersInfo(tonName, holderLength) {
  for (i = 0; i < holderLength; i++) {
    expected[tonName][String(i)] = {}

    // totalVestedAmount
    let totalVestedAmount = new BN(Math.random().toString().slice(2, 24))
    totalVestedAmount.should.be.bignumber.gt(new BN("0"));
    expected[tonName][String(i)]["totalVestedAmount"] = totalVestedAmount;

    // firstClaimAmount
    let firstClaimAmount = totalVestedAmount.mul(vestingData[tonName]["firstClaimAmountInTon"].div(new BN(vestingData[tonName]["ratio"]))).div(vestingData[tonName]["totalSupply"]);
    firstClaimAmount.should.be.bignumber.gt(new BN("0"));
    expected[tonName][String(i)]["firstClaimAmount"] = firstClaimAmount;

    // amountInDurationUnit
    let amountInDurationUnit = totalVestedAmount.sub(firstClaimAmount).div(new BN(vestingData[tonName]["durationInUnit"]));
    amountInDurationUnit.should.be.bignumber.gt(new BN("0"));
    expected[tonName][String(i)]["amountInDurationUnit"] = amountInDurationUnit;
  }

  // test
  //expected[tonName]["0"]["totalVestedAmount"] = new BN("10000");
  //expected[tonName]["0"]["firstClaimAmount"] = new BN("900");
  //expected[tonName]["0"]["amountInDurationUnit"] = new BN("910");
  //expected[tonName]["1"]["totalVestedAmount"] = new BN("10000");
  //expected[tonName]["1"]["firstClaimAmount"] = new BN("0");
  //expected[tonName]["1"]["amountInDurationUnit"] = new BN("0");
}

let vestingSwapper, ton, mton; // contract instance
let start, cliffDuration, duration;
let sourceTokens;

contract('VestingSwapper basis', function ([controller, owner, investor, ...others]) {
  beforeEach(async function () {
    ton = await TON.new({ from: owner });
    mton = await MTON.new({ from: owner });
    vestingSwapper = await VestingSwapper.new(ton.address, mton.address, { from: owner });
    swapper = await Swapper.new(ton.address, mton.address, { from: owner });
    vault = await TONVault.new(ton.address, { from: owner });
    burner = await Burner.new({ from: owner });
    
    await vestingSwapper.setBurner(burner.address, {from: owner});
    await swapper.setBurner(burner.address, {from: owner});

    await vestingSwapper.updateRatio(mton.address, vestingData["mton"]["ratio"], {from: owner});
    await swapper.updateRatio(mton.address, vestingData["mton"]["ratio"], {from: owner});

    await mton.mint(owner, vestingData["mton"]["totalSupply"], {from: owner});
    await ton.mint(vault.address, totalSupply, {from: owner});

    await vault.setApprovalAmount(vestingSwapper.address, totalSupply, {from: owner});
    await vestingSwapper.setVault(vault.address, {from: owner});
    await swapper.setVault(vault.address, {from: owner});

    generateHoldersInfo("mton", others.length);

    await mton.transfer(others[0], expected["mton"]["0"]["totalVestedAmount"], {from: owner});
    await mton.transfer(others[1], expected["mton"]["1"]["totalVestedAmount"], {from: owner});
  });

  describe('update ratio', function () {
    it('success, before initiate', async function () {
      await vestingSwapper.updateRatio(mton.address, vestingData["mton"]["ratio"], {from: owner});
    });
    it('success, before start', async function () {
      await vestingSwapper.updateRatio(mton.address, vestingData["mton"]["ratio"], {from: owner});
    });
    it('fail, after start', async function () {
      start = (await time.latest()).add(time.duration.days(1));

      await vestingSwapper.initiate(mton.address, start, 0, 0, 0, 10, {from: owner});

      currentTime = start.add(time.duration.hours(1));
      await time.increaseTo(currentTime);

      await expectRevert(
        vestingSwapper.updateRatio(mton.address, vestingData["mton"]["ratio"], {from: owner}),
        'VestingSwapper: cannot execute after start'
      );
    });
    it('fail, other caller', async function () {
      await expectRevert(
        vestingSwapper.updateRatio(mton.address, vestingData["mton"]["ratio"], {from: others[0]}),
        'Secondary: caller is not the primary account'
      );
    });
  });
  describe('before initiation', function () {
    beforeEach(async function () {
    });
    it('(VestingSwapper) releasableAmount - should be zero', async function () {
      (await vestingSwapper.releasableAmount(mton.address, others[0])).should.be.bignumber.equal(new BN(0));
    });
    it('(Swapper) releasableAmount - should be zero', async function () {
      (await swapper.releasableAmount(mton.address, others[1])).should.be.bignumber.equal(await mton.balanceOf(others[1]));
      (await swapper.releasableAmount(mton.address, others[1])).should.be.bignumber.equal(expected["mton"]["1"]["totalVestedAmount"]);
    });
    it('(VestingSwapper) updateRatio - can update the ratio', async function () {
      await vestingSwapper.updateRatio(mton.address, 1234, {from: owner});
    });
    it('(Swapper) updateRatio - can update the ratio', async function () {
      await swapper.updateRatio(mton.address, 1234, {from: owner});
    });
  });
  describe('after initiate, before start', function () {
    beforeEach(async function () {
      start = (await time.latest()).add(time.duration.days(1));
      cliffDurationInSeconds = time.duration.days(5);
      firstClaimDurationInSeconds = vestingData["mton"]["firstClaimDurationInSeconds"];
      durationInUnits = vestingData["mton"]["durationInUnit"];

      await vestingSwapper.initiate(mton.address, start, vestingData["mton"]["cliffDurationInSeconds"], vestingData["mton"]["firstClaimDurationInSeconds"], vestingData["mton"]["firstClaimAmountInTon"].div(new BN(vestingData["mton"]["ratio"])), vestingData["mton"]["durationInUnit"], {from: owner});

      await mton.approve(vestingSwapper.address, expected["mton"]["0"]["totalVestedAmount"], {from: others[0]});
      await vestingSwapper.receiveApproval(others[0], expected["mton"]["0"]["totalVestedAmount"], mton.address, new Uint8Array(0), {from: others[0]});

      await mton.approve(swapper.address, (await mton.balanceOf(others[1])), {from: others[1]});

      await time.increaseTo(start.sub(time.duration.hours(1)));
    });
    it('(VestingSwapper) updateRatio - can update the ratio', async function () {
      await vestingSwapper.updateRatio(mton.address, 1234, {from: owner});
    });
    it('(Swapper) updateRatio - can update the ratio', async function () {
      await swapper.updateRatio(mton.address, 1234, {from: owner});
    });
    it('(VestingSwapper) releasableAmount - should be zero', async function () {
      (await vestingSwapper.releasableAmount(mton.address, others[0])).should.be.bignumber.equal(new BN(0));
    });
    it('(Swapper) releasableAmount - ', async function () {
      (await swapper.releasableAmount(mton.address, others[1])).should.be.bignumber.equal((await mton.balanceOf(others[1])));
    });
    it('swap', async function () {
      balanceBefore = await ton.balanceOf(others[0]);
      await vestingSwapper.swap(mton.address, {from: others[0]});
      balanceAfter = await ton.balanceOf(others[0]);
      balanceBefore.should.be.bignumber.equal(new BN(0));
      balanceAfter.should.be.bignumber.equal(new BN(0));
    });
    describe('after start, before cliff', function () {
      beforeEach(async function () {
        await time.increaseTo(start.add(time.duration.hours(1)));
      });
      it('(VestingSwapper) updateRatio - can not update the ratio', async function () {
        await expectRevert(
          vestingSwapper.updateRatio(mton.address, 1234, {from: owner}),
          'VestingSwapper: cannot execute after start'
        );
      });
      it('(Swapper) updateRatio - can not update the ratio', async function () {
        await expectRevert(
          swapper.updateRatio(mton.address, 1234, {from: owner}),
          'VestingSwapper: cannot execute after start'
        );
      });
      it('VestingToken has no cliff', async function () {
        (await vestingSwapper.cliff(mton.address)).should.be.bignumber.equal(await vestingSwapper.start(mton.address));
      });
      describe('after cliff, before first claim', function () {
        beforeEach(async function () {
          await time.increaseTo(start.add(cliffDurationInSeconds).add(time.duration.hours(1)));
        });
        it('releasableAmount - ', async function () {
          (await vestingSwapper.releasableAmount(mton.address, others[0])).should.be.bignumber.equal(expected["mton"]["0"]["firstClaimAmount"]);
        });
        it('swap', async function () {
          let balanceBefore = await ton.balanceOf(others[0]);
          await vestingSwapper.swap(mton.address, {from: others[0]});
          let balanceAfter = await ton.balanceOf(others[0]);
          balanceAfter.should.be.bignumber.equal(balanceBefore.add(expected["mton"]["0"]["firstClaimAmount"].mul(vestingData["mton"]["ratio"])));
          //balanceAfter.should.be.bignumber.equal(balanceBefore.add(expectedAmount["ton"]["firstClaimEachAmount"][0]));
        });
        it('test after the first swap', async function () {
          await vestingSwapper.swap(mton.address, {from: others[0]});
          await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.hours(1)));
          (await vestingSwapper.releasableAmount(mton.address, others[0])).should.be.bignumber.equal(expected["mton"]["0"]["amountInDurationUnit"]);
        });
        describe('after first claim, before end', function () {
          beforeEach(async function () {
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.hours(1)));
          });
          it('releasable amount', async function () {
            (await vestingSwapper.releasableAmount(mton.address, others[0])).should.be.bignumber.equal(expected["mton"]["0"]["firstClaimAmount"].add(expected["mton"]["0"]["amountInDurationUnit"]));
          });
          it('monthly releasable amount', async function () {
            // TODO: check
            for (i = 0; i < durationInUnits; i++) {
              await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * i)).add(time.duration.hours(1)));
              (await vestingSwapper.releasableAmount(mton.address, others[0])).should.be.bignumber.equal(
                expected["mton"]["0"]["firstClaimAmount"].add(expected["mton"]["0"]["amountInDurationUnit"].mul((new BN(i+1)))));
            }

            /*let i = 0;
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * i)).add(time.duration.hours(1)));
            (await vestingSwapper.releasableAmount(mton.address, others[0])).should.be.bignumber.equal(
              expected["mton"]["0"]["firstClaimAmount"].add(expected["mton"]["0"]["amountInDurationUnit"].mul((new BN(i+1)))));

            i = 1;
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * i)).add(time.duration.hours(1)));
            (await vestingSwapper.releasableAmount(mton.address, others[0])).should.be.bignumber.equal(
              expected["mton"]["0"]["firstClaimAmount"].add(expected["mton"]["0"]["amountInDurationUnit"].mul((new BN(i+1)))));

            i = 2;
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * i)).add(time.duration.hours(1)));
            (await vestingSwapper.releasableAmount(mton.address, others[0])).should.be.bignumber.equal(
              expected["mton"]["0"]["firstClaimAmount"].add(expected["mton"]["0"]["amountInDurationUnit"].mul((new BN(i+1)))));*/
          });
          it('swap', async function () {
            let balanceBefore = await ton.balanceOf(others[0]);
            await vestingSwapper.swap(mton.address, {from: others[0]});
            let balanceAfter = await ton.balanceOf(others[0]);
            balanceAfter.should.be.bignumber.equal(balanceBefore.add((expected["mton"]["0"]["firstClaimAmount"].add(expected["mton"]["0"]["amountInDurationUnit"]).mul(vestingData["mton"]["ratio"]))));
          });
          it('(VestingSwapper) monthly swap token', async function () {
            let balanceBefore = await ton.balanceOf(others[0]);
            await vestingSwapper.swap(mton.address, {from: others[0]});
            let balanceAfter = await ton.balanceOf(others[0]);
            balanceAfter.should.be.bignumber.equal(balanceBefore.add((expected["mton"]["0"]["firstClaimAmount"].add(expected["mton"]["0"]["amountInDurationUnit"]).mul(vestingData["mton"]["ratio"]))));
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * 1)).add(time.duration.hours(1)));

            for (i = 0; i < durationInUnits - 1; i++) {
              let balanceBefore = await ton.balanceOf(others[0]);
              await vestingSwapper.swap(mton.address, {from: others[0]});
              let balanceAfter = await ton.balanceOf(others[0]);
              balanceAfter.should.be.bignumber.equal(balanceBefore.add(expected["mton"]["0"]["amountInDurationUnit"].mul(vestingData["mton"]["ratio"])));
              await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * (i+2))).add(time.duration.hours(2)));
            }

            /*let i = 0;
            balanceBefore = await ton.balanceOf(others[0]);
            vestingTokenBalanceBefore = await mton.balanceOf(others[0]);
            await vestingSwapper.swap(mton.address, {from: others[0]});
            balanceAfter = await ton.balanceOf(others[0]);
            vestingTokenBalanceAfter = await mton.balanceOf(others[0]);
            balanceAfter.should.be.bignumber.equal(balanceBefore.add(expected["mton"]["0"]["amountInDurationUnit"].mul(vestingData["mton"]["ratio"])));
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * (i+2))).add(time.duration.hours(2)));

            i = 1;
            balanceBefore = await ton.balanceOf(others[0]);
            await vestingSwapper.swap(mton.address, {from: others[0]});
            balanceAfter = await ton.balanceOf(others[0]);
            balanceAfter.should.be.bignumber.equal(balanceBefore.add(expected["mton"]["0"]["amountInDurationUnit"].mul(vestingData["mton"]["ratio"])));
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * (i+2))).add(time.duration.hours(2)));

            i = 2;
            balanceBefore = await ton.balanceOf(others[0]);
            await vestingSwapper.swap(mton.address, {from: others[0]});
            balanceAfter = await ton.balanceOf(others[0]);
            balanceAfter.should.be.bignumber.equal(balanceBefore.add(expected["mton"]["0"]["amountInDurationUnit"].mul(vestingData["mton"]["ratio"])));
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * (i+2))).add(time.duration.hours(2)));

            i = 3;
            balanceBefore = await ton.balanceOf(others[0]);
            await vestingSwapper.swap(mton.address, {from: others[0]});
            balanceAfter = await ton.balanceOf(others[0]);
            balanceAfter.should.be.bignumber.equal(balanceBefore.add(expected["mton"]["0"]["amountInDurationUnit"].mul(vestingData["mton"]["ratio"])));
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * (i+2))).add(time.duration.hours(2)));

            i = 4;
            balanceBefore = await ton.balanceOf(others[0]);
            await vestingSwapper.swap(mton.address, {from: others[0]});
            balanceAfter = await ton.balanceOf(others[0]);
            balanceAfter.should.be.bignumber.equal(balanceBefore.add(expected["mton"]["0"]["amountInDurationUnit"].mul(vestingData["mton"]["ratio"])));
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * (i+2))).add(time.duration.hours(2)));*/

          });
          describe('after end', function () {
            beforeEach(async function () {
              await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.seconds(durationUnitInSeconds*durationInUnits)).add(time.duration.hours(1)));
            });
            it('releasable amount', async function () {
              (await vestingSwapper.releasableAmount(mton.address, others[0])).should.be.bignumber.equal(expected["mton"]["0"]["totalVestedAmount"]);
            });
          });
        });
      });
    });
  });
});
