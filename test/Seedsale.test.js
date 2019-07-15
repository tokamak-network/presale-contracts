const { BN, balance, constants, ether, expectEvent, expectRevert } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory');
const VestingToken = artifacts.require('VestingToken');
const Seedsale = artifacts.require('Seedsale');

require('chai')
  .should();

contract('Seedsale', function ([owner, wallet, ...purchasers]) {
  const numerator = new BN('100');
  const denominator = new BN('3');
  const minCap = ether('200');
  const cap = ether('900');
  const decimal = new BN('18');
  const totalSupply = new BN('10').pow(decimal).mul(new BN('30000'));
  const purchaserCap = ether('300');
  const lessThanBuyerCap = purchaserCap.sub(new BN('1'));
  const moreThanBuyerCap = purchaserCap.add(new BN('1'));
  const smallPayment = ether('0.03');

  context('with token', async function () {
    beforeEach(async function () {
      this.token = await VestingToken.new(
        ZERO_ADDRESS, ZERO_ADDRESS, 0, 'MiniMe Test Token', 18, 'MMT', true, { from: owner }
      );
    });

    it('reverts with zero numerato(or zero denominator)', async function () {
      await expectRevert(
        Seedsale.new(0, denominator, wallet, this.token.address, cap, minCap, { from: owner }),
        'Seedsale: get zero value'
      );

      await expectRevert(
        Seedsale.new(numerator, 0, wallet, this.token.address, cap, minCap, { from: owner }),
        'Seedsale: get zero value'
      );
    });

    it('reverts with denominator more than numerator', async function () {
      const moreThanNumerator = numerator.add(new BN('1'));
      await expectRevert(
        Seedsale.new(numerator, moreThanNumerator, wallet, this.token.address, cap, minCap, { from: owner }),
        'Seedsale: denominator is more than numerator'
      );
    });

    it('reverts with zero min cap', async function () {
      await expectRevert(
        Seedsale.new(numerator, denominator, wallet, this.token.address, cap, 0, { from: owner }),
        'Seedsale: min cap is 0'
      );
    });

    context('once deployed', async function () {
      beforeEach(async function () {
        this.seedsale = await Seedsale.new(
          numerator, denominator, wallet, this.token.address, cap, minCap, { from: owner }
        );

        await this.token.generateTokens(this.seedsale.address, totalSupply, { from: owner });
        await this.seedsale.addWhitelisted(purchasers[0], { from: owner });
        await this.seedsale.setCap(purchasers[0], purchaserCap, { from: owner });
      });

      describe('on sale', function () {
        it('cannot buy tokens with less than min cap', async function () {
          const lessThanMinCap = minCap.sub(new BN('1'));
          await this.seedsale.addWhitelisted(purchasers[1], { from: owner });
          await this.seedsale.setCap(purchasers[1], lessThanMinCap, { from: owner });
          await expectRevert(
            this.seedsale.buyTokens(purchasers[1], { value: lessThanMinCap }),
            'Seedsale: wei amount is less than min cap or equal to 0.1 ether'
          );
        });

        it('cannot buy tokens with less than purchaser cap', async function () {
          await expectRevert(
            this.seedsale.buyTokens(purchasers[0], { value: lessThanBuyerCap }),
            'Seedsale: wei amount is not same as cap'
          );
        });

        it('cannot buy tokens with more than purchaser cap', async function () {
          await expectRevert(
            this.seedsale.buyTokens(purchasers[0], { value: moreThanBuyerCap }),
            'Seedsale: wei amount is not same as cap'
          );
        });

        it('can buy tokens', async function () {
          const walletBalance = await balance.tracker(wallet);

          const { logs } = await this.seedsale.buyTokens(purchasers[0], { from: purchasers[0], value: purchaserCap });
          expectEvent.inLogs(logs, 'TokensPurchased', {
            purchaser: purchasers[0],
            beneficiary: purchasers[0],
            value: purchaserCap,
            amount: purchaserCap.mul(numerator).div(denominator),
          });

          (await this.token.balanceOf(purchasers[0]))
            .should.be.bignumber.equal(purchaserCap.mul(numerator).div(denominator));

          (await walletBalance.delta()).should.be.bignumber.equal(purchaserCap);
        });

        it('can buy tokens with 0.1 ETH and more', async function () {
          const purchaser = purchasers[3];

          await this.seedsale.addWhitelisted(purchaser);
          await this.seedsale.setCap(purchaser, smallPayment);

          const totalValue = ether('400');
          const totalTokenAmount = totalValue.mul(numerator).div(denominator);

          const walletBalance = await balance.tracker(wallet);
          const value1 = smallPayment;
          const tokenAmount1 = value1.mul(numerator).div(denominator);

          let { logs } = await this.seedsale.buyTokens(purchaser, { from: purchaser, value: value1 });

          expectEvent.inLogs(logs, 'TokensPurchased', {
            purchaser: purchaser,
            beneficiary: purchaser,
            value: value1,
            amount: tokenAmount1,
          });

          (await this.token.balanceOf(purchaser))
            .should.be.bignumber.equal(value1.mul(numerator).div(denominator));

          (await walletBalance.delta()).should.be.bignumber.equal(value1);

          const value2 = totalValue.sub(value1);
          const tokenAmount2 = value2.mul(numerator).div(denominator);
          await this.seedsale.setCap(purchaser, totalValue);

          logs = (await this.seedsale.buyTokens(purchaser, { from: purchaser, value: value2 })).logs;

          expectEvent.inLogs(logs, 'TokensPurchased', {
            purchaser: purchaser,
            beneficiary: purchaser,
            value: value2,
            amount: tokenAmount2,
          });

          (await this.token.balanceOf(purchaser))
            .should.be.bignumber.equal(tokenAmount1.add(tokenAmount2));

          (await this.token.balanceOf(purchaser))
            .should.be.bignumber.equal(totalTokenAmount);

          (await walletBalance.delta()).should.be.bignumber.equal(value2);

          console.log(`
  totalAmount: ${totalTokenAmount.toString(10)}
  tokenAmount1: ${tokenAmount1.toString(10)}
  tokenAmount2: ${tokenAmount2.toString(10)}
          `);
        });

        it('can buy tokens as much as cap', async function () {
          const walletBalance = await balance.tracker(wallet);

          await this.seedsale.setCap(purchasers[0], cap, { from: owner });
          const { logs } = await this.seedsale.buyTokens(purchasers[0], { from: purchasers[0], value: cap });
          expectEvent.inLogs(logs, 'TokensPurchased', {
            purchaser: purchasers[0],
            beneficiary: purchasers[0],
            value: cap,
            amount: cap.mul(numerator).div(denominator),
          });

          (await this.token.balanceOf(purchasers[0]))
            .should.be.bignumber.equal(cap.mul(numerator).div(denominator));

          (await walletBalance.delta()).should.be.bignumber.equal(cap);
        });

        it('can exist remaining tokens after sale is over', async function () {
          const wallet = await this.seedsale.wallet();
          const cap = await this.seedsale.cap();
          const beforeBalance = await balance.current(wallet);
          const beforeTokenAmount = await this.token.balanceOf(this.seedsale.address);

          const value1 = ether('475');
          const value2 = ether('425');

          await this.seedsale.addWhitelisted(purchasers[1], { from: owner });
          await this.seedsale.addWhitelisted(purchasers[2], { from: owner });
          await this.seedsale.setCap(purchasers[1], value1, { from: owner });
          await this.seedsale.setCap(purchasers[2], value2, { from: owner });
          // 475 eth + 425 eth = 900 eth
          await this.seedsale.buyTokens(purchasers[1], { from: purchasers[1], value: value1 });
          await this.seedsale.buyTokens(purchasers[2], { from: purchasers[2], value: value2 });

          (await this.token.balanceOf(purchasers[1]))
            .should.be.bignumber.equal(value1.mul(numerator).div(denominator));
          (await this.token.balanceOf(purchasers[2]))
            .should.be.bignumber.equal(value2.mul(numerator).div(denominator));

          const afterBalance = await balance.current(wallet);
          const afterTokenAmount = await this.token.balanceOf(this.seedsale.address);
          (afterBalance.sub(beforeBalance)).should.be.bignumber.equal(cap);
          // The amount of tokens remaining is 1e0.
          (afterTokenAmount.sub(beforeTokenAmount)).should.be.bignumber.not.equal(new BN('0'));
        });
      });
    });
  });
});
