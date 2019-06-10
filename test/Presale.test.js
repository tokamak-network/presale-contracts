const { BN, ether, constants, expectEvent, expectRevert } = require('openzeppelin-test-helpers');
const { expect } = require('chai');

const Presale = artifacts.require('Presale');
const MiniMeToken = artifacts.require('MiniMeToken');
const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory');

require('chai')
  .should();

contract('Presale', function ([admin, investor, wallet, other]) {
  const rate = new BN('2');
  const cap = ether('100');
  const individualCap = ether('10');
  const lessThanIndividualCap = ether('5');
  const tokenSupply = new BN('10').pow(new BN('22'));

  beforeEach(async function () {
    this.tokenFactory = await MiniMeTokenFactory.new();
    this.token = await MiniMeToken.new(
      this.tokenFactory.address,
      constants.ZERO_ADDRESS,
      0,
      'MiniMe Test Token',
      18,
      'MMT',
      true);
    this.presale = await Presale.new(rate, wallet, this.token.address, cap, individualCap, { from: admin });
  });

  describe('individual cap', function () {
    it('sets a cap when the sender is a admin', async function () {
      await this.presale.setIndividualCap(individualCap, { from: admin });
      (await this.presale.getIndividualCap()).should.be.bignumber.equal(individualCap);
    });

    it('reverts when a non-admin sets a cap', async function () {
      await expectRevert(this.presale.setIndividualCap(individualCap, { from: other }),
        'WhitelistAdminRole: caller does not have the WhitelistAdmin role'
      );
    });

    context('with individual cap and whitelist', function () {
      beforeEach(async function () {
        await this.presale.setIndividualCap(individualCap, { from: admin });
        await this.presale.addWhitelisted(investor, {from: admin });
        await this.token.generateTokens(this.presale.address, tokenSupply, { from: admin });
      });

      describe('accepting payments', function () {
        it('should accept payments within individual cap', async function () {
          await this.presale.buyTokens(investor, { value: lessThanIndividualCap });
        });

        it('should reject payments outside individual cap', async function () {
          await this.presale.buyTokens(investor, { value: individualCap });
          await expectRevert(this.presale.buyTokens(investor, { value: 1 }),
            'Presale: beneficiary\'s individual cap exceeded'
          );
        });

        it('should reject payments that exceed individual cap', async function () {
          await expectRevert(this.presale.buyTokens(investor, { value: individualCap.addn(1) }),
            'Presale: beneficiary\'s individual cap exceeded'
          );
        });

        it('should reject purchase from non-whitelisted beneficiaries', async function () {
          await expectRevert(this.presale.buyTokens(other, { from: other, value: individualCap }),
            'WhitelistCrowdsale: beneficiary doesn\'t have the Whitelisted role'
          );
        });
      });
    });
  });
});