const { BN, constants, expectEvent, expectRevert, time } = require('openzeppelin-test-helpers');
const Web3 = require('web3');
const { ZERO_ADDRESS } = constants;

const VestingSwapper = artifacts.require('VestingSwapper');
const TON = artifacts.require('TON');
const MTON = artifacts.require('MTON');
const VestingToken = artifacts.require('VestingToken');
const TONVault = artifacts.require('TONVault');
const Burner = artifacts.require('Burner');

require('chai')
  .should();

const tonTotalSupply = new BN('50000000000000000000000000');
const durationUnitInSeconds = 60*60*24*30;

const presaleFirstClaimDurationInSeconds = new BN("1728000"); // 60*60*24*20
const startTimestamp = 0; // will be set using blocktime
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
    "totalSupply": new BN("1501834361269942226382433"),
    "totalAllocationTon": new BN("2600005000000000000000000"),
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
    //"totalVestedAmount": 0
  }
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
  //expected[tonName]["0"]["totalVestedAmount"] = new BN("1234567890123456789");
  //expected[tonName]["0"]["firstClaimAmount"] = new BN("12345678901234567");
  //expected[tonName]["0"]["amountInDurationUnit"] = new BN("203703701870370370");
}

let vestingSwapper, ton, vestingToken; // contract instance
let start, cliffDuration, duration;
let sourceTokens;

contract('VestingSwapper basis', function ([controller, owner, investor, ...others]) {
  beforeEach(async function () {
    vestingToken = await VestingToken.new(
      ZERO_ADDRESS, ZERO_ADDRESS, 0, 'SEED TON', 18, 'STON', true, { from: owner }
    );
    ton = await TON.new({ from: owner });
    mton = await MTON.new({ from: owner });
    vestingSwapper = await VestingSwapper.new(ton.address, mton.address, { from: owner });
    vault = await TONVault.new(ton.address, { from: owner });
    burner = await Burner.new({ from: owner });
    
    await vestingSwapper.setBurner(burner.address, {from: owner});

    await vestingSwapper.updateRatio(vestingToken.address, vestingData["seed"]["ratio"], {from: owner});

    await vestingToken.generateTokens(owner, vestingData["seed"]["totalSupply"], {from: owner});
    await ton.mint(vault.address, tonTotalSupply, {from: owner});

    await vault.setApprovalAmount(vestingSwapper.address, tonTotalSupply, {from: owner});
    await vestingSwapper.setVault(vault.address, {from: owner});

    await vestingToken.changeController(vestingSwapper.address, {from: owner});
    //sourceTokens = [vestingToken, privateTON, strategicTON];

    generateHoldersInfo("seed", others.length);

    await vestingToken.transfer(others[0], expected["seed"]["0"]["totalVestedAmount"], {from: owner});
  });

  describe('before initiation', function () {
    beforeEach(async function () {
    });
    it('releasableAmount - should be zero', async function () {
      (await vestingSwapper.releasableAmount(vestingToken.address, others[0])).should.be.bignumber.equal(new BN(0));
    });
  });
  describe('after initiate, before start', function () {
    beforeEach(async function () {
      start = (await time.latest()).add(time.duration.days(1));
      cliffDurationInSeconds = time.duration.days(5);
      firstClaimDurationInSeconds = vestingData["seed"]["firstClaimDurationInSeconds"];
      durationInUnits = vestingData["seed"]["durationInUnit"];

      await vestingSwapper.initiate(vestingToken.address, start, vestingData["seed"]["cliffDurationInSeconds"], vestingData["seed"]["firstClaimDurationInSeconds"], vestingData["seed"]["firstClaimAmountInTon"].div(new BN(vestingData["seed"]["ratio"])), vestingData["seed"]["durationInUnit"], {from: owner});

      await vestingToken.approveAndCall(vestingSwapper.address, expected["seed"]["0"]["totalVestedAmount"], new Uint8Array(0), {from: others[0]});
      await time.increaseTo(start.sub(time.duration.hours(1)));
    });
    describe('updateRatio', function () {
      it('updateRatio - should succeed', async function () {
        await vestingSwapper.updateRatio(vestingToken.address, 1234, {from: owner});
      });
      it('updateRatio - should fail from others', async function () {
        await expectRevert(
          vestingSwapper.updateRatio(vestingToken.address, 1234, {from: others[0]}),
          "Secondary: caller is not the primary account"
        );
      });
    });
    describe('setBurner', function () {
      it('setBurner - should succeed', async function () {
        await vestingSwapper.setBurner(burner.address, {from: owner});
      });
      it('setBurner - should fail from others', async function () {
        await expectRevert(
          vestingSwapper.setBurner(burner.address, {from: others[0]}),
          "Secondary: caller is not the primary account"
        );
      });
    });
    describe('setVault', function () {
      it('setVault - should succeed', async function () {
        await vestingSwapper.setVault(vault.address, {from: owner});
      });
      it('setVault - should fail from others', async function () {
        await expectRevert(
          vestingSwapper.setVault(vault.address, {from: others[0]}),
          "Secondary: caller is not the primary account"
        );
      });
    });
    it('releasableAmount - should be zero', async function () {
      (await vestingSwapper.releasableAmount(vestingToken.address, others[0])).should.be.bignumber.equal(new BN(0));
    });
    it('swap', async function () {
      balanceBefore = await ton.balanceOf(others[0]);
      await vestingSwapper.swap(vestingToken.address, {from: others[0]});
      balanceAfter = await ton.balanceOf(others[0]);
      balanceBefore.should.be.bignumber.equal(new BN(0));
      balanceAfter.should.be.bignumber.equal(new BN(0));
    });
    describe('after start, before cliff', function () {
      beforeEach(async function () {
        await time.increaseTo(start.add(time.duration.hours(1)));
      });
      it('VestingToken has no cliff', async function () {
        (await vestingSwapper.cliff(vestingToken.address)).should.be.bignumber.equal(await vestingSwapper.start(vestingToken.address));
      });
      describe('after cliff, before first claim', function () {
        beforeEach(async function () {
          await time.increaseTo(start.add(cliffDurationInSeconds).add(time.duration.hours(1)));
        });
        it('releasableAmount - ', async function () {
          (await vestingSwapper.releasableAmount(vestingToken.address, others[0])).should.be.bignumber.equal(expected["seed"]["0"]["firstClaimAmount"]);
        });
        it('swap', async function () {
          let balanceBefore = await ton.balanceOf(others[0]);
          await vestingSwapper.swap(vestingToken.address, {from: others[0]});
          let balanceAfter = await ton.balanceOf(others[0]);
          balanceAfter.should.be.bignumber.equal(balanceBefore.add(expected["seed"]["0"]["firstClaimAmount"].mul(vestingData["seed"]["ratio"])));
        });
        it('test after the first swap', async function () {
          await vestingSwapper.swap(vestingToken.address, {from: others[0]});
          await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.hours(1)));
          (await vestingSwapper.releasableAmount(vestingToken.address, others[0])).should.be.bignumber.equal(expected["seed"]["0"]["amountInDurationUnit"]);
        });
        describe('after first claim, before end', function () {
          beforeEach(async function () {
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.hours(1)));
          });
          it('releasable amount', async function () {
            (await vestingSwapper.releasableAmount(vestingToken.address, others[0])).should.be.bignumber.equal(expected["seed"]["0"]["firstClaimAmount"].add(expected["seed"]["0"]["amountInDurationUnit"]));
          });
          it('monthly releasable amount', async function () {
            for (i = 0; i < durationInUnits; i++) {
              await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * i)).add(time.duration.hours(1)));
              (await vestingSwapper.releasableAmount(vestingToken.address, others[0])).should.be.bignumber.equal(
                expected["seed"]["0"]["firstClaimAmount"].add(expected["seed"]["0"]["totalVestedAmount"].sub(expected["seed"]["0"]["firstClaimAmount"]).mul(new BN(i+1)).div(new BN(vestingData["seed"]["durationInUnit"]))));
            }

            /*let i = 0;
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * i)).add(time.duration.hours(1)));
            (await vestingSwapper.releasableAmount(vestingToken.address, others[0])).should.be.bignumber.equal(
              expected["seed"]["0"]["firstClaimAmount"].add(expected["seed"]["0"]["amountInDurationUnit"].mul((new BN(i+1)))));

            i = 1;
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * i)).add(time.duration.hours(1)));
            (await vestingSwapper.releasableAmount(vestingToken.address, others[0])).should.be.bignumber.equal(
              expected["seed"]["0"]["firstClaimAmount"].add(expected["seed"]["0"]["amountInDurationUnit"].mul((new BN(i+1)))));

            i = 2;
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * i)).add(time.duration.hours(1)));
            (await vestingSwapper.releasableAmount(vestingToken.address, others[0])).should.be.bignumber.equal(
              expected["seed"]["0"]["firstClaimAmount"].add(expected["seed"]["0"]["amountInDurationUnit"].mul((new BN(i+1)))));*/
          });
          it('swap', async function () {
            let balanceBefore = await ton.balanceOf(others[0]);
            await vestingSwapper.swap(vestingToken.address, {from: others[0]});
            let balanceAfter = await ton.balanceOf(others[0]);
            balanceAfter.should.be.bignumber.equal(balanceBefore.add((expected["seed"]["0"]["firstClaimAmount"].add(expected["seed"]["0"]["amountInDurationUnit"]).mul(vestingData["seed"]["ratio"]))));
          });
          it('should be burned after swap', async function () {
            const totalSupply1 = await vestingToken.totalSupply();
            await vestingSwapper.swap(vestingToken.address, {from: others[0]});
            const totalSupply2 = await vestingToken.totalSupply();
            totalSupply2.should.be.bignumber.lt(totalSupply1);
          });
          it('should be transfered to burner after swap', async function () {
            await vestingSwapper.addUsingBurnerContract(vestingToken.address, {from: owner});
            const balance1 = await vestingToken.balanceOf(burner.address);
            await vestingSwapper.swap(vestingToken.address, {from: others[0]});
            const balance2 = await vestingToken.balanceOf(burner.address);
            balance2.should.be.bignumber.gt(balance1);
          });
          it('monthly swap token', async function () {
            let balanceBefore = await ton.balanceOf(others[0]);
            await vestingSwapper.swap(vestingToken.address, {from: others[0]});
            let balanceAfter = await ton.balanceOf(others[0]);
            //balanceAfter.should.be.bignumber.equal(balanceBefore.add((expected["seed"]["0"]["firstClaimAmount"].add(expected["seed"]["0"]["amountInDurationUnit"]).mul(vestingData["seed"]["ratio"]))));
            balanceAfter.should.be.bignumber.equal(balanceBefore.add((expected["seed"]["0"]["firstClaimAmount"].add(expected["seed"]["0"]["amountInDurationUnit"]).mul(vestingData["seed"]["ratio"]))));
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * 1)).add(time.duration.hours(1)));

            let initTonAmount = await ton.balanceOf(others[0]);
            for (i = 0; i < durationInUnits-1; i++) {
              let balanceBefore = await ton.balanceOf(others[0]);
              await vestingSwapper.swap(vestingToken.address, {from: others[0]});
              let balanceAfter = await ton.balanceOf(others[0]);
              //balanceAfter.should.be.bignumber.equal(balanceBefore.add(expected["seed"]["0"]["amountInDurationUnit"].mul(vestingData["seed"]["ratio"])));
              balanceAfter.should.be.bignumber.not.lt(balanceBefore.add(expected["seed"]["0"]["amountInDurationUnit"].mul(vestingData["seed"]["ratio"])));

              await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * (i+2))).add(time.duration.hours(2)));
            }
            await vestingSwapper.swap(vestingToken.address, {from: others[0]});
            (await ton.balanceOf(others[0])).should.be.bignumber.equal(expected["seed"]["0"]["totalVestedAmount"].mul(vestingData["seed"]["ratio"]));

            /*let i = 0;
            balanceBefore = await ton.balanceOf(others[0]);
            vestingTokenBalanceBefore = await vestingToken.balanceOf(others[0]);
            await vestingSwapper.swap(vestingToken.address, {from: others[0]});
            balanceAfter = await ton.balanceOf(others[0]);
            vestingTokenBalanceAfter = await vestingToken.balanceOf(others[0]);
            balanceAfter.should.be.bignumber.equal(balanceBefore.add(expected["seed"]["0"]["amountInDurationUnit"].mul(vestingData["seed"]["ratio"])));
            vestingTokenBalanceAfter.should.be.bignumber.lt(vestingTokenBalanceBefore);
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * (i+2))).add(time.duration.hours(2)));

            i = 1;
            balanceBefore = await ton.balanceOf(others[0]);
            await vestingSwapper.swap(vestingToken.address, {from: others[0]});
            balanceAfter = await ton.balanceOf(others[0]);
            balanceAfter.should.be.bignumber.equal(balanceBefore.add(expected["seed"]["0"]["amountInDurationUnit"].mul(vestingData["seed"]["ratio"])));
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * (i+2))).add(time.duration.hours(2)));

            i = 2;
            balanceBefore = await ton.balanceOf(others[0]);
            await vestingSwapper.swap(vestingToken.address, {from: others[0]});
            balanceAfter = await ton.balanceOf(others[0]);
            balanceAfter.should.be.bignumber.equal(balanceBefore.add(expected["seed"]["0"]["amountInDurationUnit"].mul(vestingData["seed"]["ratio"])));
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * (i+2))).add(time.duration.hours(2)));

            i = 3;
            balanceBefore = await ton.balanceOf(others[0]);
            await vestingSwapper.swap(vestingToken.address, {from: others[0]});
            balanceAfter = await ton.balanceOf(others[0]);
            balanceAfter.should.be.bignumber.equal(balanceBefore.add(expected["seed"]["0"]["amountInDurationUnit"].mul(vestingData["seed"]["ratio"])));
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * (i+2))).add(time.duration.hours(2)));

            i = 4;
            balanceBefore = await ton.balanceOf(others[0]);
            await vestingSwapper.swap(vestingToken.address, {from: others[0]});
            balanceAfter = await ton.balanceOf(others[0]);
            balanceAfter.should.be.bignumber.equal(balanceBefore.add(expected["seed"]["0"]["amountInDurationUnit"].mul(vestingData["seed"]["ratio"])));
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * (i+2))).add(time.duration.hours(2)));*/
          });
          describe('after end', function () {
            beforeEach(async function () {
              await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.seconds(durationUnitInSeconds*durationInUnits)).add(time.duration.hours(1)));
            });
            it('releasable amount', async function () {
              (await vestingSwapper.releasableAmount(vestingToken.address, others[0])).should.be.bignumber.equal(expected["seed"]["0"]["totalVestedAmount"]);
            });
            it('swap', async function () {
              (await vestingSwapper.totalAmount(vestingToken.address, others[0], {from: others[0]})).should.be.bignumber.equal(expected["seed"]["0"]["totalVestedAmount"]);
              (await vestingToken.balanceOf(vestingSwapper.address)).should.be.bignumber.not.lt(expected["seed"]["0"]["totalVestedAmount"]);
              let balanceBefore = await ton.balanceOf(others[0]);
              await vestingSwapper.swap(vestingToken.address, {from: others[0]});
              let balanceAfter = await ton.balanceOf(others[0]);
              balanceAfter.should.be.bignumber.equal(balanceBefore.add(expected["seed"]["0"]["totalVestedAmount"].mul(vestingData["seed"]["ratio"])));
            });
          });
        });
      });
    });
  });
});
