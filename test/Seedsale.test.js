const { BN, constants, ether, expectEvent, expectRevert } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory');
const MiniMeToken = artifacts.require('MiniMeToken');
const Seedsale = artifacts.require('Seedsale');

contract('Seedsale', function ([_, owner, wallet, purchaser]) {
  const rate = new BN('2');
  const cap = ether('50');
  const totalSupply = new BN('10').pow(new BN('20'));
  const purchaserCap = ether('10');
  const lessThanBuyerCap = purchaserCap.sub(new BN('1'));
  const moreThanBuyerCap = purchaserCap.add(new BN('1'));

  context('once deployed', async function () {
    beforeEach(async function () {
      const tokenFactory = await MiniMeTokenFactory.new({ from: owner });
      this.token = await MiniMeToken.new(
        tokenFactory.address, ZERO_ADDRESS, 0, 'MiniMe Test Token', 18, 'MMT', true, { from: owner }
      );
      this.seedsale = await Seedsale.new(rate, wallet, this.token.address, cap, { from: owner });

      await this.token.generateTokens(this.seedsale.address, totalSupply, { from: owner });
      await this.seedsale.addWhitelisted(purchaser, { from: owner });
      await this.seedsale.setCap(purchaser, purchaserCap, { from: owner });
    });

    describe('on sale', function () {
      it('cannot buy tokens with less than purchaser cap', async function () {
        await expectRevert(
          this.seedsale.buyTokens(purchaser, { value: lessThanBuyerCap }),
          'Seedsale: wei amount is not exact'
        );
      });

      it('cannot buy tokens with more than purchaser cap', async function () {
        await expectRevert(
          this.seedsale.buyTokens(purchaser, { value: moreThanBuyerCap }),
          'Seedsale: wei amount is not exact'
        );
      });

      it('can buy tokens', async function () {
        const { logs } = await this.seedsale.buyTokens(purchaser, { from: purchaser, value: purchaserCap });
        expectEvent.inLogs(logs, 'TokensPurchased', {
          purchaser: purchaser,
          beneficiary: purchaser,
          value: purchaserCap,
          amount: purchaserCap.mul(rate),
        });
      });
    });
  });
});
