const { BN, balance, constants, ether, expectEvent, expectRevert } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory');
const MiniMeToken = artifacts.require('MiniMeToken');
const Seedsale = artifacts.require('Seedsale');

require('chai')
  .should();

contract('Seedsale', function ([_, owner, wallet, ...purchaser]) {
  const numerator = new BN('100');
  const denominator = new BN('3');
  const cap = ether('900');
  const decimal = new BN('18');
  const totalSupply = new BN('10').pow(decimal).mul(new BN('30000'));
  const purchaserCap = ether('200');
  const lessThanBuyerCap = purchaserCap.sub(new BN('1'));
  const moreThanBuyerCap = purchaserCap.add(new BN('1'));

  context('with token', async function () {
    beforeEach(async function () {
      const tokenFactory = await MiniMeTokenFactory.new({ from: owner });
      this.token = await MiniMeToken.new(
        tokenFactory.address, ZERO_ADDRESS, 0, 'MiniMe Test Token', 18, 'MMT', true, { from: owner }
      );
    });

    it('reverts with zero numerato(or zero denominator)', async function () {
      await expectRevert(
        Seedsale.new(0, denominator, wallet, this.token.address, cap, { from: owner }),
        'Seedsale: get zero value'
      );

      await expectRevert(
        Seedsale.new(numerator, 0, wallet, this.token.address, cap, { from: owner }),
        'Seedsale: get zero value'
      );
    });

    it('reverts with denominator more than numerator', async function () {
      const moreThanNumerator = numerator.add(new BN('1'));
      await expectRevert(
        Seedsale.new(numerator, moreThanNumerator, wallet, this.token.address, cap, { from: owner }),
        'Seedsale: denominator is more than numerator'
      );
    });

    context('once deployed', async function () {
      beforeEach(async function () {
        this.seedsale = await Seedsale.new(numerator, denominator, wallet, this.token.address, cap, { from: owner });

        await this.token.generateTokens(this.seedsale.address, totalSupply, { from: owner });
        await this.seedsale.addWhitelisted(purchaser[0], { from: owner });
        await this.seedsale.setCap(purchaser[0], purchaserCap, { from: owner });
      });

      describe('on sale', function () {
        it('cannot buy tokens with less than purchaser cap', async function () {
          await expectRevert(
            this.seedsale.buyTokens(purchaser[0], { value: lessThanBuyerCap }),
            'Seedsale: wei amount is not exact'
          );
        });

        it('cannot buy tokens with more than purchaser cap', async function () {
          await expectRevert(
            this.seedsale.buyTokens(purchaser[0], { value: moreThanBuyerCap }),
            'Seedsale: wei amount is not exact'
          );
        });

        it('can buy tokens', async function () {
          const { logs } = await this.seedsale.buyTokens(purchaser[0], { from: purchaser[0], value: purchaserCap });
          expectEvent.inLogs(logs, 'TokensPurchased', {
            purchaser: purchaser[0],
            beneficiary: purchaser[0],
            value: purchaserCap,
            amount: purchaserCap.mul(numerator).div(denominator),
          });
        });

        it('can buy tokens as much as cap', async function () {
          await this.seedsale.setCap(purchaser[0], cap, { from: owner });
          const { logs } = await this.seedsale.buyTokens(purchaser[0], { from: purchaser[0], value: cap });
          expectEvent.inLogs(logs, 'TokensPurchased', {
            purchaser: purchaser[0],
            beneficiary: purchaser[0],
            value: cap,
            amount: cap.mul(numerator).div(denominator),
          });
        });

        it('can exist remaining tokens after sale is over', async function () {
          const wallet = await this.seedsale.wallet();
          const cap = await this.seedsale.cap();
          const beforeBalance = await balance.current(wallet);
          const beforeTokenAmount = await this.token.balanceOf(this.seedsale.address);

          const value1 = ether('400');
          const value2 = ether('100');

          await this.seedsale.addWhitelisted(purchaser[1], { from: owner });
          await this.seedsale.addWhitelisted(purchaser[2], { from: owner });
          await this.seedsale.addWhitelisted(purchaser[3], { from: owner });
          await this.seedsale.setCap(purchaser[1], value1, { from: owner });
          await this.seedsale.setCap(purchaser[2], value1, { from: owner });
          await this.seedsale.setCap(purchaser[3], value2, { from: owner });
          // 400 eth + 400 eth + 100 eth = 900 eth
          await this.seedsale.buyTokens(purchaser[1], { from: purchaser[1], value: value1 });
          await this.seedsale.buyTokens(purchaser[2], { from: purchaser[2], value: value1 });
          await this.seedsale.buyTokens(purchaser[3], { from: purchaser[3], value: value2 });

          const afterBalance = await balance.current(wallet);
          const afterTokenAmount = await this.token.balanceOf(this.seedsale.address);
          (afterBalance.sub(beforeBalance)).should.be.bignumber.equal(cap);
          // The amount of tokens remaining is 1.
          (afterTokenAmount.sub(beforeTokenAmount)).should.be.bignumber.not.equal(new BN('0'));
        });
      });
    });
  });
});
