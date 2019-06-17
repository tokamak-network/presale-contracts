const { BN, constants, expectRevert } = require('openzeppelin-test-helpers');

const MiniMeToken = artifacts.require('MiniMeToken');
const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory');
const ERC20Mintable = artifacts.require('ERC20Mintable');
const Swapper = artifacts.require('Swapper');

require('chai')
  .should();

contract('Swapper', function ([_, controller, admin, ptonHolder, mtonHolder, other]) {
  const decimals = new BN('18');
  const initialAmount = new BN('10').pow(decimals); // number of tokens sold at public sale
  const ptonAmount = new BN('10').pow(decimals).mul(new BN('50'));
  const mtonAmount = new BN('10').pow(decimals).mul(new BN('50'));

  it('requires a non-zero initial amount', async function () {
    await expectRevert(
      Swapper.new(0, constants.ZERO_ADDRESS, constants.ZERO_ADDRESS, constants.ZERO_ADDRESS),
      'Swapper: initial supply is zero'
    );
  });

  it('requires a non-zero address', async function () {
    await expectRevert(
      Swapper.new(initialAmount, constants.ZERO_ADDRESS, constants.ZERO_ADDRESS, constants.ZERO_ADDRESS),
      'Swapper: zero address'
    );
  });

  context('with token', async function () {
    beforeEach(async function () {
      this.tokenFactory = await MiniMeTokenFactory.new({ from: controller });
      this.pton = await MiniMeToken.new(
        this.tokenFactory.address,
        constants.ZERO_ADDRESS,
        0,
        'MiniMe Test Token',
        18,
        'PTON',
        true,
        { from: controller }
      );
      // use create clone?
      this.mton = await MiniMeToken.new(
        this.tokenFactory.address,
        constants.ZERO_ADDRESS,
        0,
        'MiniMe Test Token',
        18,
        'MTON',
        true,
        { from: controller }
      );
      this.ton = await ERC20Mintable.new({ from: admin });
      this.swapper = await Swapper.new(
        initialAmount,
        this.pton.address,
        this.mton.address,
        this.ton.address,
        { from: admin }
      );

      await this.pton.generateTokens(ptonHolder, ptonAmount, { from: controller });
      await this.mton.generateTokens(mtonHolder, mtonAmount, { from: controller });
      await this.ton.addMinter(this.swapper.address, { from: admin });
    });

    describe('swap', function () {
      it('reverts when allowance is zero', async function () {
        await expectRevert(
          this.swapper.swapFromPTON(),
          'Swapper: allowance is zero'
        );

        await expectRevert(
          this.swapper.swapFromMTON(),
          'Swapper: allowance is zero'
        );
      });

      it('reverts when sender has no token', async function () {
        await this.pton.approve(this.swapper.address, ptonAmount, { from: other });
        await expectRevert(
          this.swapper.swapFromPTON({ from: other }),
          'MiniMeToken: short balance'
        );

        await this.mton.approve(this.swapper.address, mtonAmount, { from: other });
        await expectRevert(
          this.swapper.swapFromMTON({ from: other }),
          'MiniMeToken: short balance'
        );
      });

      it('swap from PTON to TON', async function () {
        const ptonAmount = await this.pton.balanceOf(ptonHolder);
        await this.pton.approve(this.swapper.address, ptonAmount, { from: ptonHolder });

        // ton = pton * initialAmount / 100
        await this.swapper.swapFromPTON({ from: ptonHolder });
        (await this.ton.balanceOf(ptonHolder)).should.be.bignumber
          .equal(ptonAmount.mul(initialAmount).div(new BN('100')));
      });

      it('swap from MTON to TON', async function () {
        const mtonAmount = await this.mton.balanceOf(mtonHolder);
        await this.mton.approve(this.swapper.address, mtonAmount, { from: mtonHolder });

        // ton = mton * initialAmount / 1000000
        await this.swapper.swapFromMTON({ from: mtonHolder });
        (await this.ton.balanceOf(mtonHolder)).should.be.bignumber
          .equal(mtonAmount.mul(initialAmount).div(new BN('1000000')));
      });
    });
  });
});
