const NFTT = artifacts.require('NFTT')
const { utils } = require('ethers')
const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')

contract('NFTT', async accounts => {
  beforeEach(async () => {
    this.contract = await NFTT.deployed()
  })

  it('should mint a token and emmit a Transfer event', async () => {
    const priceWei = utils.parseEther('1.5')

    const tokenId = new BN(1)

    const mintTo = accounts[0]
    const receipt = await this.contract.mintCollectable(
      mintTo,
      tokenId,
      'Token 1',
      priceWei,
      true,
      {
        from: mintTo,
      }
    )

    expectEvent(receipt, 'Transfer', {
      from: constants.ZERO_ADDRESS,
      to: mintTo,
      tokenId,
    })
  })

  it('should revert for transfering to zero address', async () => {
    const from = accounts[0]
    const to = constants.ZERO_ADDRESS

    await expectRevert(
      this.contract.safeTransferFrom(from, to, 1, { from }),
      'ERC721: transfer to the zero address'
    )
  })

  it('should match token meta', async () => {
    const priceWei = utils.parseEther('1.5')
    const tokenId = new BN(1)

    const { id, price, name, uri, sale } = await this.contract.tokenMeta(tokenId)

    assert.equal(id, '1')
    assert.equal(price, priceWei)
    assert.equal(name, 'Token 1')
    assert.equal(uri, '1')
    assert.equal(sale, true)
  })

  it('should transfer token successfully, match new owner and emit a Transfer event', async () => {
    const from = accounts[0]
    const to = accounts[1]

    const tokenId = new BN(1)

    const receipt = await this.contract.safeTransferFrom(from, to, tokenId, { from })

    const ownerNFTT = await this.contract.ownerOf(tokenId)
    assert.equal(ownerNFTT, to)

    expectEvent(receipt, 'Transfer', {
      from,
      to,
      tokenId,
    })
  })

  it('should purchase token', async () => {
    const sender = accounts[0]
    const tokenId = new BN(1)

    await this.contract.purchaseToken(tokenId, { from: sender, value: utils.parseEther('1.5') })
    const newOwner = await this.contract.ownerOf(tokenId)

    assert.equal(newOwner, sender)
  })

  it('should revert for buying already owned token', async () => {
    const sender = accounts[0]
    const tokenId = new BN(1)

    await expectRevert.unspecified(
      this.contract.purchaseToken(tokenId, { from: sender, value: utils.parseEther('1.5') })
    )
  })

  it('should revert for trying to buy token for less than the set price', async () => {
    const sender = accounts[1]
    const tokenId = new BN(1)

    await expectRevert.unspecified(
      this.contract.purchaseToken(tokenId, { from: sender, value: utils.parseEther('1') })
    )
  })

  it('should return all tokens on sale', async () => {
    const tokens = await this.contract.getAllOnSale()
    assert.equal(tokens.length, 1)
  })
})
