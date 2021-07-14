import { NFTTInstance } from '../types/truffle-contracts'

const NFTT = artifacts.require('NFTT')
const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')

let contractInstance: NFTTInstance

contract('NFTT', async accounts => {
  beforeEach(async () => {
    contractInstance = await NFTT.deployed()
  })

  it('should mint a token and emmit a Transfer event', async () => {
    const priceWei = new BN(1.5)
    const tokenId = new BN(1)

    const mintTo = accounts[0]
    const receipt = await contractInstance.mintCollectable(
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
      contractInstance.transferFrom(from, to, 1, { from }),
      'ERC721: transfer to the zero address'
    )
  })

  it('should match token meta', async () => {
    const priceWei = new BN(1.5)
    const tokenId = new BN(1)

    const { id, price, name, uri, sale } = await contractInstance.tokenMeta(tokenId)

    assert.equal(id, tokenId)
    assert.equal(price, priceWei)
    assert.equal(name, 'Token 1')
    assert.equal(uri, '1')
    assert.equal(sale, true)
  })

  it('should transfer token successfully, match new owner and emit a Transfer event', async () => {
    const from = accounts[0]
    const to = accounts[1]

    const tokenId = new BN(1)

    const receipt = await contractInstance.transferFrom(from, to, tokenId, { from })

    const ownerNFTT = await contractInstance.ownerOf(tokenId)
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

    await contractInstance.purchaseToken(tokenId, { from: sender, value: new BN(1.5) })
    const newOwner = await contractInstance.ownerOf(tokenId)

    assert.equal(newOwner, sender)
  })

  it('should revert for buying already owned token', async () => {
    const sender = accounts[0]
    const tokenId = new BN(1)

    await expectRevert.unspecified(
      contractInstance.purchaseToken(tokenId, { from: sender, value: new BN(1.5) })
    )
  })

  it('should revert for trying to buy token for less than the set price', async () => {
    const sender = accounts[1]
    const tokenId = new BN(1)

    await expectRevert.unspecified(
      contractInstance.purchaseToken(tokenId, { from: sender, value: new BN(0.1) })
    )
  })

  it('should return all tokens on sale', async () => {
    const tokens = await contractInstance.getAllOnSale()
    assert.equal(tokens.length, 1)
  })

  it('should change token price', async () => {
    const newPrice = new BN(2)
    const tokenId = new BN(1)

    await contractInstance.setTokenPrice(tokenId, newPrice, { from: accounts[0] })

    const price = await contractInstance.tokenPrice(tokenId)

    assert.equal(price.toString(), newPrice.toString())
  })

  it('should remove token from sale', async () => {
    const tokenId = new BN(1)
    const price = new BN(2)

    await contractInstance.setTokenSale(tokenId, false, price, { from: accounts[0] })

    const { sale } = await contractInstance.tokenMeta(tokenId)

    assert.equal(sale, false)
  })
})
