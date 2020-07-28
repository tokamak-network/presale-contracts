const { BN, constants, expectEvent, expectRevert, time } = require('openzeppelin-test-helpers');
const Web3 = require('web3');
const { ZERO_ADDRESS } = constants;

const VestingSwapper = artifacts.require('VestingSwapper');
const Swapper = artifacts.require('Swapper');
const TON = artifacts.require('TON');
const MTON = artifacts.require('MTON');
const VestingToken = artifacts.require('VestingToken');
const VestingTokenStep = artifacts.require('VestingTokenStep');
const TONVault = artifacts.require('TONVault');
const Burner = artifacts.require('Burner');

require('chai')
  .should();

//const amount = new BN('1000');
const totalSupply = new BN('50000000000000000000000000');

/*const seedAmount = new BN('10000');
const privateAmount = new BN('20000');
const strategicAmount = new BN('30000');
const mtonAmount = new BN('10000');*/

const genericRatio = new BN('50');
const seedRatio = genericRatio;
const privateRatio = genericRatio;
const strategicRatio = genericRatio;
const mtonRatio = new BN('1');
const ratios = [seedRatio, privateRatio, strategicRatio];
const durationUnitInSeconds = 60*60*24*30;
const durationInUnits = 10;

const vaultWithdrawRestrictionPeriod = time.duration.days(40*30);

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
    "ratio": 50,
    "startTimestamp": startTimestamp, 
    "cliffDurationInSeconds": 0,
    "firstClaimDurationInSeconds": presaleFirstClaimDurationInSeconds, 
    "firstClaimAmountInTon": new BN("15000000000000000000000"), 
    "durationInUnit": 6
  },
  "private": {
    "totalSupply": new BN("144000083230664748493368"),
    "totalAllocationTon": new BN("7200004161533237424668400"),
    "ratio": 50,
    "startTimestamp": startTimestamp, 
    "cliffDurationInSeconds": 0,
    "firstClaimDurationInSeconds": presaleFirstClaimDurationInSeconds, 
    "firstClaimAmountInTon": new BN("360000000000000000000000"), 
    "durationInUnit": 10
  },
  "strategic": {
    "totalSupply": new BN("84000100000000000000000"),
    "totalAllocationTon": new BN("4200005000000000000000000"),
    "ratio": 50,
    "startTimestamp": startTimestamp, 
    "cliffDurationInSeconds": 0,
    "firstClaimDurationInSeconds": presaleFirstClaimDurationInSeconds, 
    "firstClaimAmountInTon": new BN("378000000000000000000000"), 
    "durationInUnit": 10
  },
  "team": {
    "totalSupply": new BN("150000000000000000000000"),
    "totalAllocationTon": new BN("7500000000000000000000000"),
    "ratio": 50,
    "startTimestamp": startTimestamp, 
    "cliffDurationInSeconds": 6,
    "firstClaimDurationInSeconds": 0, 
    "firstClaimAmountInTon": 0, 
    "durationInUnit": 36
  },
  "advisor": {
    "totalSupply": new BN("75000000000000000000000000"),
    "totalAllocationTon": new BN("1500000000000000000000000"),
    "ratio": 50,
    "startTimestamp": startTimestamp, 
    "cliffDurationInSeconds": 6,
    "firstClaimDurationInSeconds": 0, 
    "firstClaimAmountInTon": 0, 
    "durationInUnit": 18
  },
  "business": {
    "totalSupply": new BN("250000000000000000000000000"),
    "totalAllocationTon": new BN("5000000000000000000000000"),
    "ratio": 50,
    "startTimestamp": startTimestamp, 
    "cliffDurationInSeconds": 0,
    "firstClaimDurationInSeconds": 0, 
    "firstClaimAmountInTon": 0, 
    "durationInUnit": 20
  },
  "reserve": {
    "totalSupply": new BN("150000000000000000000000000"),
    "totalAllocationTon": new BN("3000000000000000000000000"),
    "ratio": 50,
    "startTimestamp": startTimestamp, 
    "cliffDurationInSeconds": 12,
    "firstClaimDurationInSeconds": 0, 
    "firstClaimAmountInTon": 0, 
    "durationInUnit": 30
  },
  "mton": {
    "totalSupply": new BN("2600000000000000000000000"),
    "totalAllocationTon": new BN("2600000000000000000000000"),
    "ratio": 1,
    "startTimestamp": startTimestamp, 
    "cliffDurationInSeconds": 12,
    "firstClaimDurationInSeconds": 0, 
    "firstClaimAmountInTon": 0, 
    "durationInUnit": 30
  },
}

let vestingSwapper, swapper, ton, seedTON, privateTON, strategicTON; // contract instance
let deployedTokens = [seedTON, privateTON, strategicTON];

let testTon1, testTon2, testTon3, testTon4;
let testTons;
let start, cliffDuration, duration;
let sourceTokens;
let vaultWithdrawableTime; // the restriction period of ton in vault

contract('VestingSwapper basis', function ([controller, owner, investor, ...others]) {
  beforeEach(async function () {
    // deploy seed/private/strategic tons
    seedTON = await VestingToken.new(ZERO_ADDRESS, ZERO_ADDRESS, 0, 'SEED TON', 18, 'STON', true, { from: owner });
    privateTON = await VestingToken.new(ZERO_ADDRESS, ZERO_ADDRESS, 0, 'PRIVATE TON', 18, 'PTON', true, { from: owner});
    strategicTON = await VestingToken.new(ZERO_ADDRESS, ZERO_ADDRESS, 0, 'STRATEGIC TON', 18, 'STTON', true, { from: owner });

    // deploy mton
    mton = await MTON.new({ from: owner });

    // deploy ton
    ton = await TON.new({ from: owner });

    // deploy swapper
    vestingSwapper = await VestingSwapper.new(ton.address, mton.address, { from: owner });
    swapper = await Swapper.new(ton.address, mton.address, { from: owner });


    // deploy other tons
    testTon1 = await VestingTokenStep.new(ZERO_ADDRESS, ZERO_ADDRESS, 0, 'TEST TON 1', 18, 'TTON1', true, { from: owner });
    testTon2 = await VestingTokenStep.new(ZERO_ADDRESS, ZERO_ADDRESS, 0, 'TEST TON 2', 18, 'TTON2', true, { from: owner });
    testTon3 = await VestingTokenStep.new(ZERO_ADDRESS, ZERO_ADDRESS, 0, 'TEST TON 3', 18, 'TTON3', true, { from: owner });
    testTon4 = await VestingTokenStep.new(ZERO_ADDRESS, ZERO_ADDRESS, 0, 'TEST TON 4', 18, 'TTON4', true, { from: owner });
    testTons = [testTon1, testTon2, testTon3, testTon4];

    vaultWithdrawableTime = (await time.latest()).add(vaultWithdrawRestrictionPeriod);
    vault = await TONVault.new(ton.address, vaultWithdrawableTime, { from: owner });
    burner = await Burner.new({ from: owner });
    
    await vestingSwapper.setBurner(burner.address, {from: owner});
    await swapper.setBurner(burner.address, {from: owner});

    await vestingSwapper.updateRatio(seedTON.address, vestingData["seed"]["ratio"], {from: owner});
    await vestingSwapper.updateRatio(privateTON.address, vestingData["private"]["ratio"], {from: owner});
    await vestingSwapper.updateRatio(strategicTON.address, vestingData["strategic"]["ratio"], {from: owner});
    await vestingSwapper.updateRatio(mton.address, vestingData["mton"]["ratio"], {from: owner});
    await swapper.updateRatio(mton.address, vestingData["mton"]["ratio"], {from: owner});
    for (i = 0; i < testTons.length; i++) {
      await swapper.updateRatio(testTons[i].address, genericRatio, {from: owner});
    }
    
    // mint
    await seedTON.generateTokens(owner, vestingData["seed"]["totalSupply"], {from: owner});
    await privateTON.generateTokens(owner, vestingData["private"]["totalSupply"], {from: owner});
    await strategicTON.generateTokens(owner, vestingData["strategic"]["totalSupply"], {from: owner});
    await ton.mint(vault.address, totalSupply, {from: owner});
    await mton.mint(owner, vestingData["mton"]["totalSupply"], {from: owner});
    await testTon1.generateTokens(owner, vestingData["team"]["totalSupply"], {from: owner});
    await testTon2.generateTokens(owner, vestingData["advisor"]["totalSupply"], {from: owner});
    await testTon3.generateTokens(owner, vestingData["business"]["totalSupply"], {from: owner});
    await testTon4.generateTokens(owner, vestingData["reserve"]["totalSupply"], {from: owner});

    await seedTON.transfer(investor, parseInt(vestingData["seed"]["totalSupply"]/3), {from: owner});
    await privateTON.transfer(investor, parseInt(vestingData["private"]["totalSupply"]/3), {from: owner});
    await strategicTON.transfer(investor, parseInt(vestingData["strategic"]["totalSupply"]/3), {from: owner});
    await mton.transfer(investor, parseInt(vestingData["mton"]["totalSupply"]/3), {from: owner});
    await testTon1.transfer(investor, parseInt(vestingData["team"]["totalSupply"]/3), {from: owner});
    await testTon2.transfer(investor, parseInt(vestingData["advisor"]["totalSupply"]/3), {from: owner});
    await testTon3.transfer(investor, parseInt(vestingData["business"]["totalSupply"]/3), {from: owner});
    await testTon4.transfer(investor, parseInt(vestingData["reserve"]["totalSupply"]/3), {from: owner});

    await seedTON.transfer(others[0], parseInt(vestingData["seed"]["totalSupply"]/3), {from: owner});
    await privateTON.transfer(others[0], parseInt(vestingData["private"]["totalSupply"]/3), {from: owner});
    await strategicTON.transfer(others[0], parseInt(vestingData["strategic"]["totalSupply"]/3), {from: owner});
    await mton.transfer(others[0], parseInt(vestingData["mton"]["totalSupply"]/3), {from: owner});
    await testTon1.transfer(others[0], parseInt(vestingData["team"]["totalSupply"]/3), {from: owner});
    await testTon2.transfer(others[0], parseInt(vestingData["advisor"]["totalSupply"]/3), {from: owner});
    await testTon3.transfer(others[0], parseInt(vestingData["business"]["totalSupply"]/3), {from: owner});
    await testTon4.transfer(others[0], parseInt(vestingData["reserve"]["totalSupply"]/3), {from: owner});

    await vault.setApprovalAmount(vestingSwapper.address, totalSupply, {from: owner});
    await vestingSwapper.setVault(vault.address, {from: owner});
    await vault.setApprovalAmount(swapper.address, totalSupply, {from: owner});
    await swapper.setVault(vault.address, {from: owner});

    await seedTON.changeController(vestingSwapper.address, {from: owner});
    await privateTON.changeController(vestingSwapper.address, {from: owner});
    await strategicTON.changeController(vestingSwapper.address, {from: owner});
    for (i = 0; i < testTons.length; i++) {
      await testTons[i].changeController(swapper.address, {from: owner});
    }
    
    sourceTokens = [seedTON, privateTON, strategicTON];
  });
  describe('before initiation', function () {
    it('releasable amount should be zero', async function () {
      (await vestingSwapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(new BN(0));
      (await vestingSwapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(new BN(0));
      (await vestingSwapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(new BN(0));
      (await vestingSwapper.releasableAmount(mton.address, investor)).should.be.bignumber.equal(new BN(0));

      (await vestingSwapper.releasableAmount(testTon1.address, others[0])).should.be.bignumber.equal(new BN(0));
      (await vestingSwapper.releasableAmount(testTon2.address, others[0])).should.be.bignumber.equal(new BN(0));
      (await vestingSwapper.releasableAmount(testTon3.address, others[0])).should.be.bignumber.equal(new BN(0));
      (await vestingSwapper.releasableAmount(testTon4.address, others[0])).should.be.bignumber.equal(new BN(0));
      (await vestingSwapper.releasableAmount(mton.address, others[0])).should.be.bignumber.equal(new BN(0));
    });
    it('can not swap', async function () {
      balanceBefore = await ton.balanceOf(investor);
      await vestingSwapper.swap(seedTON.address, {from: investor});
      balanceAfter = await ton.balanceOf(investor);
      balanceBefore.should.be.bignumber.equal(new BN(0));
      balanceAfter.should.be.bignumber.equal(new BN(0));

      await swapper.swap(testTon1.address, {from: investor});
      balanceAfter = await ton.balanceOf(investor);
      balanceBefore.should.be.bignumber.equal(new BN(0));
      balanceAfter.should.be.bignumber.equal(new BN(0));
    });
  });
  describe('after initiate, before start', function () {
    beforeEach(async function () {
      start = (await time.latest()).add(time.duration.days(1));
      cliffDurationInSeconds = time.duration.days(5);
      firstClaimDurationInSeconds = time.duration.days(10);

      await vestingSwapper.initiate(seedTON.address, start, cliffDurationInSeconds, firstClaimDurationInSeconds, vestingData["seed"]["firstClaimAmountInTon"], durationInUnits, {from: owner});
      await vestingSwapper.initiate(privateTON.address, start, cliffDurationInSeconds, firstClaimDurationInSeconds, vestingData["private"]["firstClaimAmountInTon"], durationInUnits, {from: owner});
      await vestingSwapper.initiate(strategicTON.address, start, cliffDurationInSeconds, firstClaimDurationInSeconds, vestingData["strategic"]["firstClaimAmountInTon"], durationInUnits, {from: owner});
      await vestingSwapper.initiate(mton.address, start, cliffDurationInSeconds, firstClaimDurationInSeconds, vestingData["mton"]["firstClaimAmountInTon"], durationInUnits, {from: owner});

      let tempBalance = await seedTON.balanceOf(investor);
      tempBalance.should.be.bignumber.gt(new BN("0"));
      await seedTON.approveAndCall(vestingSwapper.address, tempBalance, new Uint8Array(0), {from: investor});
      (await seedTON.balanceOf(investor)).should.be.bignumber.equal(new BN("0"));
      (await vestingSwapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(new BN("0"));
      await time.increaseTo(start.sub(time.duration.hours(1)));
      tempBalance = await privateTON.balanceOf(investor);
      await privateTON.approveAndCall(vestingSwapper.address, tempBalance, new Uint8Array(0), {from: investor});
      tempBalance = await strategicTON.balanceOf(investor);
      await strategicTON.approveAndCall(vestingSwapper.address, tempBalance, new Uint8Array(0), {from: investor});
    });
    it('deposit', async function () {
      (await seedTON.balanceOf(investor)).should.be.bignumber.equal(new BN("0"));
      (await seedTON.balanceOf(vestingSwapper.address)).should.be.bignumber.gt(new BN("0"));
    });
    it('releasable amount should be zero', async function () {
      (await vestingSwapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(new BN(0));
      (await vestingSwapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(new BN(0));
      (await vestingSwapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(new BN(0));
      (await vestingSwapper.releasableAmount(mton.address, investor)).should.be.bignumber.equal(new BN(0));

      (await vestingSwapper.releasableAmount(testTon1.address, others[0])).should.be.bignumber.equal(new BN(0));
      (await vestingSwapper.releasableAmount(testTon2.address, others[0])).should.be.bignumber.equal(new BN(0));
      (await vestingSwapper.releasableAmount(testTon3.address, others[0])).should.be.bignumber.equal(new BN(0));
      (await vestingSwapper.releasableAmount(testTon4.address, others[0])).should.be.bignumber.equal(new BN(0));
      (await vestingSwapper.releasableAmount(mton.address, others[0])).should.be.bignumber.equal(new BN(0));
    });
    it('can not swap', async function () {
      balanceBefore = await ton.balanceOf(investor);
      await vestingSwapper.swap(seedTON.address, {from: investor});
      balanceAfter = await ton.balanceOf(investor);
      balanceBefore.should.be.bignumber.equal(new BN(0));
      balanceAfter.should.be.bignumber.equal(new BN(0));

      await swapper.swap(testTon1.address, {from: investor});
      balanceAfter = await ton.balanceOf(investor);
      balanceBefore.should.be.bignumber.equal(new BN(0));
      balanceAfter.should.be.bignumber.equal(new BN(0));
    });
    describe('after start, before cliff', function () {
      beforeEach(async function () {
        await time.increaseTo(start.add(time.duration.hours(1)));
      });
      it('releasable amount should be zero', async function () {
        (await vestingSwapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(new BN(0));
        (await vestingSwapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(new BN(0));
        (await vestingSwapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(new BN(0));
        (await vestingSwapper.releasableAmount(mton.address, investor)).should.be.bignumber.equal(new BN(0));

        (await vestingSwapper.releasableAmount(testTon1.address, others[0])).should.be.bignumber.equal(new BN(0));
        (await vestingSwapper.releasableAmount(testTon2.address, others[0])).should.be.bignumber.equal(new BN(0));
        (await vestingSwapper.releasableAmount(testTon3.address, others[0])).should.be.bignumber.equal(new BN(0));
        (await vestingSwapper.releasableAmount(testTon4.address, others[0])).should.be.bignumber.equal(new BN(0));
        (await vestingSwapper.releasableAmount(mton.address, others[0])).should.be.bignumber.equal(new BN(0));
      });
      it('can not swap', async function () {
        balanceBefore = await ton.balanceOf(investor);
        await vestingSwapper.swap(seedTON.address, {from: investor});
        balanceAfter = await ton.balanceOf(investor);
        balanceBefore.should.be.bignumber.equal(new BN(0));
        balanceAfter.should.be.bignumber.equal(new BN(0));

        await swapper.swap(testTon1.address, {from: investor});
        balanceAfter = await ton.balanceOf(investor);
        balanceBefore.should.be.bignumber.equal(new BN(0));
        balanceAfter.should.be.bignumber.equal(new BN(0));
      });
      describe('after cliff, before first claim', function () {
        beforeEach(async function () {
          await time.increaseTo(start.add(cliffDurationInSeconds).add(time.duration.hours(1)));
        });
        it('releasable amount', async function () {
          let start = await vestingSwapper.start(seedTON.address);
          let cliff = await vestingSwapper.cliff(seedTON.address);
          let firstClaim = await vestingSwapper.firstClaim(seedTON.address);
          let current_time = (await time.latest());
          current_time.should.be.bignumber.gt(cliff);
          current_time.should.be.bignumber.lt(firstClaim);
          
          (await vestingSwapper._releasableAmountLimit(seedTON.address, investor)).should.be.bignumber.equal(new BN("0"));
          (await vestingSwapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.gt(new BN("0"));
          (await vestingSwapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.gt(new BN("0"));
          (await vestingSwapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.gt(new BN("0"));
          //(await vestingSwapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(expectedAmount["seed"]["firstClaim"]);
          //(await vestingSwapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(expectedAmount["private"]["firstClaim"]);
          //(await vestingSwapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(expectedAmount["strategic"]["firstClaim"]);
        });
        it('swap', async function () {
          let releasable = await vestingSwapper.releasableAmount(seedTON.address, investor);
          (await ton.balanceOf(vault.address)).should.be.bignumber.gt(releasable.mul(new BN("50")));
          //(await seedTON.balanceOf(vestingSwapper.address)).should.be.bignumber.equal(new BN("123"));

          let balanceBefore = await ton.balanceOf(investor);
          await vestingSwapper.swap(seedTON.address, {from: investor});
          let balanceAfter = await ton.balanceOf(investor);
          balanceAfter.should.be.bignumber.gt(balanceBefore);

          /*let initAmount = await ton.balanceOf(investor);
          for (i = 0; i < 3; i++) {
            let balanceBefore = await ton.balanceOf(investor);
            await vestingSwapper.swap(sourceTokens[i].address, {from: investor});
            let balanceAfter = await ton.balanceOf(investor);
            balanceAfter.should.be.bignumber.gt(balanceBefore);
            //balanceAfter.should.be.bignumber.equal(balanceBefore.add(expectedAmount["ton"]["firstClaimEachAmount"][i]));
          }*/
          //(await ton.balanceOf(investor)).should.be.bignumber.equal(initAmount.add(expectedAmount["ton"]["firstClaimTotal"]));
        });
        describe('after first claim, before end', function () {
          beforeEach(async function () {
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.hours(1)));
          });
          it('releasable amount', async function () {
          });
          it('monthly releasable amount', async function () {
          });
          it('swap', async function () {
          });
          it('monthly swap token1', async function () {
          });
          describe('after end', function () {
            beforeEach(async function () {
              await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.seconds(durationUnitInSeconds*durationInUnits)).add(time.duration.hours(1)));
            });
            it('releasable amount', async function () {
              (await vestingSwapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(new BN(parseInt(seedAmount/2)));
              (await vestingSwapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(new BN(parseInt(privateAmount/2)));
              (await vestingSwapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(new BN(parseInt(strategicAmount/2)));
            });
          });
        });
      });
    });
  });
});
