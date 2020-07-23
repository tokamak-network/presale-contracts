const { BN, constants, expectEvent, expectRevert, time } = require('openzeppelin-test-helpers');
const Web3 = require('web3');
const { ZERO_ADDRESS } = constants;

const Swapper = artifacts.require('Swapper');
const TON = artifacts.require('TON');
const VestingToken = artifacts.require('VestingToken');
const TONVault = artifacts.require('TONVault');

require('chai')
  .should();

const amount = new BN('1000');
const totalSupply = amount.mul(new BN('100'));

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
*/

const seedAmount = new BN('10000');
const privateAmount = new BN('20000');
const strategicAmount = new BN('30000');

const seedRate = new BN('10');
const privateRate = new BN('20');
const strategicRate = new BN('30');
const durationUnitInSeconds = 60*60*24*30;
const durationInUnits = 10;

const expectedReleasableAmount = {
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
};

const expectedReleasableAmount_noFirstClaim = {
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
};

let swapper, token, seedTON, privateTON, strategicTON; // contract instance
let start, cliffDuration, duration;

contract('Swapper basis', function ([controller, owner, investor, ...others]) {
  beforeEach(async function () {
    seedTON = await VestingToken.new(
      ZERO_ADDRESS, ZERO_ADDRESS, 0, 'SEED TON', 18, 'STON', true, { from: owner }
    );
    privateTON = await VestingToken.new(
      ZERO_ADDRESS, ZERO_ADDRESS, 0, 'PRIVATE TON', 18, 'PTON', true, { from: owner }
    );
    strategicTON = await VestingToken.new(
      ZERO_ADDRESS, ZERO_ADDRESS, 0, 'STRATEGIC TON', 18, 'STTON', true, { from: owner }
    );
    token = await TON.new({ from: owner });
    swapper = await Swapper.new(token.address, { from: owner });
    vault = await TONVault.new(token.address, { from: owner });
    
    await swapper.updateRatio(seedTON.address, seedRate, {from: owner});
    await swapper.updateRatio(privateTON.address, privateRate, {from: owner});
    await swapper.updateRatio(strategicTON.address, strategicRate, {from: owner});

    await seedTON.generateTokens(investor, seedAmount, {from: owner});
    await privateTON.generateTokens(investor, privateAmount, {from: owner});
    await strategicTON.generateTokens(investor, strategicAmount, {from: owner});
    await token.mint(vault.address, totalSupply, {from: owner});

    await vault.setApprovalAmount(swapper.address, totalSupply, {from: owner});

    await seedTON.changeController(swapper.address, {from: owner});
    await privateTON.changeController(swapper.address, {from: owner});
    await strategicTON.changeController(swapper.address, {from: owner});
  });

  describe('update ratio', function () {
    it('success, before initiate', async function () {
      await swapper.updateRatio(seedTON.address, seedRate, {from: owner});
      await swapper.updateRatio(privateTON.address, privateRate, {from: owner});
      await swapper.updateRatio(strategicTON.address, strategicRate, {from: owner});
    });
    it('success, before start', async function () {
      await swapper.updateRatio(seedTON.address, seedRate, {from: owner});
      await swapper.updateRatio(privateTON.address, privateRate, {from: owner});
      await swapper.updateRatio(strategicTON.address, strategicRate, {from: owner});
    });
    it('fail, after start', async function () {
      start = (await time.latest()).add(time.duration.days(1));

      await swapper.initiate(seedTON.address, start, 0, 0, 0, 10, {from: owner});
      await swapper.initiate(privateTON.address, start, 0, 0, 0, 10, {from: owner});
      await swapper.initiate(strategicTON.address, start, 0, 0, 0, 10, {from: owner});

      currentTime = start.add(time.duration.hours(1));
      await time.increaseTo(currentTime);

      await expectRevert(
        swapper.updateRatio(seedTON.address, seedRate, {from: owner}),
        'Swapper: cannot execute after start'
      );
      await expectRevert(
        swapper.updateRatio(privateTON.address, privateRate, {from: owner}),
        'Swapper: cannot execute after start'
      );
      await expectRevert(
        swapper.updateRatio(strategicTON.address, strategicRate, {from: owner}),
        'Swapper: cannot execute after start'
      );
    });
    it('fail, other caller', async function () {
      await expectRevert(
        swapper.updateRatio(seedTON.address, seedRate, {from: others[0]}),
        'Secondary: caller is not the primary account'
      );
      await expectRevert(
        swapper.updateRatio(privateTON.address, privateRate, {from: others[0]}),
        'Secondary: caller is not the primary account'
      );
      await expectRevert(
        swapper.updateRatio(strategicTON.address, strategicRate, {from: others[0]}),
        'Secondary: caller is not the primary account'
      );
    });
  });
  describe('before initiation', function () {
    beforeEach(async function () {

    });
    it('releasable amount should be zero', async function () {
      (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(new BN(0));
      (await swapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(new BN(0));
      (await swapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(new BN(0));
    });
  });
  describe('after initiate, before start', function () {
    beforeEach(async function () {
      start = (await time.latest()).add(time.duration.days(1));
      cliffDurationInSeconds = time.duration.days(5);
      firstClaimDurationInSeconds = time.duration.days(10);

      await swapper.initiate(seedTON.address, start, cliffDurationInSeconds, firstClaimDurationInSeconds, expectedReleasableAmount["seed"]["firstClaim"], durationInUnits, {from: owner});
      await swapper.initiate(privateTON.address, start, cliffDurationInSeconds, firstClaimDurationInSeconds, expectedReleasableAmount["private"]["firstClaim"], durationInUnits, {from: owner});
      await swapper.initiate(strategicTON.address, start, cliffDurationInSeconds, firstClaimDurationInSeconds, expectedReleasableAmount["strategic"]["firstClaim"], durationInUnits, {from: owner});

      await seedTON.approveAndCall(swapper.address, seedAmount, new Uint8Array(0), {from: investor});
      await time.increaseTo(start.sub(time.duration.hours(1)));
      await privateTON.approveAndCall(swapper.address, privateAmount, new Uint8Array(0), {from: investor});
      await strategicTON.approveAndCall(swapper.address, strategicAmount, new Uint8Array(0), {from: investor});
    });
    it('releasable amount should be zero', async function () {
      (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(new BN(0));
      (await swapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(new BN(0));
      (await swapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(new BN(0));
    });
    describe('after start, before cliff', function () {
      beforeEach(async function () {
        await time.increaseTo(start.add(time.duration.hours(1)));
      });
      it('releasable amount should be zero', async function () {
        (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(new BN(0));
        (await swapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(new BN(0));
        (await swapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(new BN(0));
      });
      describe('after cliff, before first claim', function () {
        beforeEach(async function () {
          await time.increaseTo(start.add(cliffDurationInSeconds).add(time.duration.hours(1)));
        });
        it('releasable amount', async function () {
          let start = await swapper.start(seedTON.address);
          let cliff = await swapper.cliff(seedTON.address);
          let firstClaim = await swapper.firstClaim(seedTON.address);
          let current_time = (await time.latest());
          current_time.should.be.bignumber.gt(cliff);
          current_time.should.be.bignumber.lt(firstClaim);
          (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(expectedReleasableAmount["seed"]["firstClaim"]);
          (await swapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(expectedReleasableAmount["private"]["firstClaim"]);
          (await swapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(expectedReleasableAmount["strategic"]["firstClaim"]);
        });
        describe('after first claim, before end', function () {
          beforeEach(async function () {
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.hours(1)));
          });
          describe('after end', function () {
            beforeEach(async function () {
              await time.increaseTo(start.add(durationUnitInSeconds).add(time.duration.hours(1)));
            });
          });
          
        });
        
      });
    });
  });
  describe('after initiate(zero cliff), before start', function () {
    beforeEach(async function () {
      start = (await time.latest()).add(time.duration.days(1));
      cliffDurationInSeconds = 0;
      firstClaimDurationInSeconds = time.duration.days(10);

      await swapper.initiate(seedTON.address, start, cliffDurationInSeconds, firstClaimDurationInSeconds, expectedReleasableAmount["seed"]["firstClaim"], durationInUnits, {from: owner});
      await swapper.initiate(privateTON.address, start, cliffDurationInSeconds, firstClaimDurationInSeconds, expectedReleasableAmount["private"]["firstClaim"], durationInUnits, {from: owner});
      await swapper.initiate(strategicTON.address, start, cliffDurationInSeconds, firstClaimDurationInSeconds, expectedReleasableAmount["strategic"]["firstClaim"], durationInUnits, {from: owner});

      await time.increaseTo(start.sub(time.duration.hours(1)));

      await seedTON.approveAndCall(swapper.address, seedAmount, new Uint8Array(0), {from: investor});
      await privateTON.approveAndCall(swapper.address, privateAmount, new Uint8Array(0), {from: investor});
      await strategicTON.approveAndCall(swapper.address, strategicAmount, new Uint8Array(0), {from: investor});
    });
    it('releasable amount should be zero', async function () {
      (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(new BN(0));
      (await swapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(new BN(0));
      (await swapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(new BN(0));
    });
    describe('after start, zero cliff, before first claim', function () {
      beforeEach(async function () {
        await time.increaseTo(start.add(time.duration.hours(1)));
      });
      it('releasable amount', async function () {
        (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(expectedReleasableAmount["seed"]["firstClaim"]);
        (await swapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(expectedReleasableAmount["private"]["firstClaim"]);
        (await swapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(expectedReleasableAmount["strategic"]["firstClaim"]);
      });
      describe('after first claim, before end', function () {
        beforeEach(async function () {
          await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.hours(1)));
        });
        it('releasable amount', async function () {
          (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(expectedReleasableAmount["seed"]["firstClaim"].add(expectedReleasableAmount["seed"]["inUnit"]));
          (await swapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(expectedReleasableAmount["private"]["firstClaim"].add(expectedReleasableAmount["private"]["inUnit"]));
          (await swapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(expectedReleasableAmount["strategic"]["firstClaim"].add(expectedReleasableAmount["strategic"]["inUnit"]));
        });
        it('monthly releasable amount', async function () {
          for (i = 0; i < durationInUnits; i++)
          {
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.days(30 * i)).add(time.duration.hours(1)));
            (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(
              expectedReleasableAmount["seed"]["firstClaim"].add(expectedReleasableAmount["seed"]["inUnit"].mul((new BN(i)).add(new BN(1)))));
            (await swapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(
              expectedReleasableAmount["private"]["firstClaim"].add(expectedReleasableAmount["private"]["inUnit"].mul((new BN(i)).add(new BN(1)))));
            (await swapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(
              expectedReleasableAmount["strategic"]["firstClaim"].add(expectedReleasableAmount["strategic"]["inUnit"].mul((new BN(i)).add(new BN(1)))));
          }
        });
        describe('after end', function () {
          beforeEach(async function () {
            await time.increaseTo(start.add(firstClaimDurationInSeconds).add(time.duration.seconds(durationUnitInSeconds*durationInUnits)).add(time.duration.hours(1)));
          });
          it('releasable amount', async function () {
            (await swapper.releasableAmount(seedTON.address, investor)).should.be.bignumber.equal(seedAmount);
            (await swapper.releasableAmount(privateTON.address, investor)).should.be.bignumber.equal(privateAmount);
            (await swapper.releasableAmount(strategicTON.address, investor)).should.be.bignumber.equal(strategicAmount);
          });
        });
      });
    });
  });
  describe('after initiate(zero cliff, no first claim), before start', function () {
    beforeEach(async function () {
      start = (await time.latest()).add(time.duration.days(1));
      cliffDurationInSeconds = 0;
      firstClaimDurationInSeconds = 0;
      firstClaimAmount = 0
      durationUnit = 24

      await swapper.initiate(seedTON.address, start, cliffDurationInSeconds, firstClaimDurationInSeconds, firstClaimAmount, durationUnit, {from: owner});
      await swapper.initiate(privateTON.address, start, cliffDurationInSeconds, firstClaimDurationInSeconds, firstClaimAmount, durationUnit, {from: owner});
      await swapper.initiate(strategicTON.address, start, cliffDurationInSeconds, firstClaimDurationInSeconds, firstClaimAmount, durationUnit, {from: owner});

      await time.increaseTo(start.sub(time.duration.hours(1)));
    });
    describe('after start, zero cliff, no first claim, before end', function () {
      beforeEach(async function () {
        await time.increaseTo(start.add(time.duration.hours(1)));
      });
      describe('after end', function () {
        beforeEach(async function () {
          await time.increaseTo(start.add(durationUnitInSeconds).add(time.duration.hours(1)));
        });
      });
    });
  });




  /*describe('after start, before start', function () {
    beforeEach(async function () {
      start = (await time.latest()).add(time.duration.days(1));
      cliffDurationInSeconds = time.duration.years(1);
      firstClaimDurationInSeconds = time.duration.years(2);
      firstClaimAmount = 100
      durationUnit = 24

      await swapper.initiate(seedTON.address, start, cliffDurationInSeconds, firstClaimDurationInSeconds, firstClaimAmount, durationUnit, {from: owner});
      await swapper.initiate(privateTON.address, start, cliffDurationInSeconds, firstClaimDurationInSeconds, firstClaimAmount, durationUnit, {from: owner});
      await swapper.initiate(strategicTON.address, start, cliffDurationInSeconds, firstClaimDurationInSeconds, firstClaimAmount, durationUnit, {from: owner});

      await time.increaseTo(start.sub(time.duration.hours(1)));
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
      start = (await time.latest()).add(time.duration.days(1));
      cliffDuration = 0;
      duration = time.duration.years(2);

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
    token = await TON.new({ from: owner });
    swapper = await Swapper.new(token.address, { from: owner });
    await swapper.updateRatio(seedTON.address, seedRate, {from: owner});
    await swapper.updateRatio(privateTON.address, privateRate, {from: owner});
    await swapper.updateRatio(strategicTON.address, strategicRate, {from: owner});

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
  });*/
});
