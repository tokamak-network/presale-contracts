const { BN, balance, constants, ether, expectEvent, expectRevert } = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory');
const MiniMeToken = artifacts.require('MiniMeToken');
const Capitalsale = artifacts.require('Capitalsale');

require('chai')
  .should();

contract('Capitalsale', function ([_, owner, wallet, ...purchaser]) {
  const decimal = new BN('18');
  const rate = new BN('15');
  const totalSupply = new BN('10').pow(decimal).mul(new BN('150000'));
  const cap = ether('10000');
  const individualMinCap = ether('200');
  const individualMaxCap = ether('2000');
  const lessThanIndividualMinCap = individualMinCap.sub(new BN('1'));
  const moreThanIndividualMaxCap = individualMaxCap.add(new BN('1'));
  const value = ether('1000');

  context('with token', async function () {
    beforeEach(async function () {
      const tokenFactory = await MiniMeTokenFactory.new({ from: owner });
      this.token = await MiniMeToken.new(
        tokenFactory.address, ZERO_ADDRESS, 0, 'MiniMe Test Token', 18, 'MMT', true, { from: owner }
      );
    });

    it('reverts with zero cap value', async function () {
      await expectRevert(
        Capitalsale.new(
          rate, wallet, this.token.address, cap, 0, individualMaxCap, { from: owner }
        ),
        'Capitalsale: individual cap value is zero'
      );

      await expectRevert(
        Capitalsale.new(
          rate, wallet, this.token.address, cap, individualMinCap, 0, { from: owner }
        ),
        'Capitalsale: individual cap value is zero.'
      );
    });

    it('reverts with individual min cap more than individual max cap', async function () {
      const lessThanIndividualMinCap = individualMinCap.sub(new BN('1'));
      await expectRevert(
        Capitalsale.new(
          rate, wallet, this.token.address, cap, individualMinCap, lessThanIndividualMinCap, { from: owner }
        ),
        'Capitalsale: min cap is more than max cap'
      );
    });

    context('once deployed', async function () {
      beforeEach(async function () {
        this.capitalsale = await Capitalsale.new(
          rate, wallet, this.token.address, cap, individualMinCap, individualMaxCap, { from: owner }
        );
        await this.token.generateTokens(this.capitalsale.address, totalSupply, { from: owner });
        await this.capitalsale.addWhitelisted(purchaser[0], { from: owner });
      });

      it('can get individual min cap and individual max cap', async function () {
        (await this.capitalsale.individualMinCap()).should.be.bignumber.equal(individualMinCap);
        (await this.capitalsale.individualMaxCap()).should.be.bignumber.equal(individualMaxCap);
      });

      describe('on sale', function () {
        it('cannot buy tokens with less than individual min cap', async function () {
          await expectRevert(
            this.capitalsale.buyTokens(purchaser[0], { value: lessThanIndividualMinCap }),
            'Capitalsale: less than individual min cap'
          );
        });

        it('cannot buy tokens with more than individual max cap', async function () {
          await expectRevert(
            this.capitalsale.buyTokens(purchaser[0], { value: moreThanIndividualMaxCap }),
            'Capitalsale: more than individual max cap'
          );
        });

        it('can buy tokens', async function () {
          const { logs } = await this.capitalsale.buyTokens(purchaser[0], { from: purchaser[0], value: value });
          expectEvent.inLogs(logs, 'TokensPurchased', {
            purchaser: purchaser[0],
            beneficiary: purchaser[0],
            value: value,
            amount: value.mul(rate),
          });
        });
      });
    });
  });
});
