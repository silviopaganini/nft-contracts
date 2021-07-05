const NFTT = artifacts.require('NFTT')
const { utils } = require('ethers')

contract('NFTT', async accounts => {
  it('should deploy contract without error', async () => {
    await NFTT.deployed()
    assert.ok(true)
  })

  it('should mint a token', async () => {
    const priceWei = utils.parseEther('1.5')

    const contract = await NFTT.deployed()
    await contract.mintCollectable(accounts[0], '1', 'Token 1', priceWei, true, {
      from: accounts[0],
    })

    assert.ok(true)
  })

  it('should match token meta', async () => {
    const contract = await NFTT.deployed()
    const priceWei = utils.parseEther('1.5')
    const { id, price, name, uri, sale } = await contract.tokenMeta(1)

    assert.equal(id, '1')
    assert.equal(price, priceWei)
    assert.equal(name, 'Token 1')
    assert.equal(uri, '1')
    assert.equal(sale, true)
  })

  it('should transfer token', async () => {
    const contract = await NFTT.deployed()
    const acc1 = accounts[0]
    const acc2 = accounts[1]

    await contract.safeTransferFrom(acc1, acc2, 1, { from: acc1 })

    const ownerNFTT = await contract.ownerOf(1)
    assert.equal(ownerNFTT, acc2)
  })

  it('should purchase token', async () => {
    const contract = await NFTT.deployed()
    const acc1 = accounts[0]

    await contract.purchaseToken(1, { from: acc1, value: utils.parseEther('1.5') })
    const newOwner = await contract.ownerOf(1)

    assert.equal(newOwner, acc1)
  })

  it('should return all tokens on sale', async () => {
    const contract = await NFTT.deployed()

    const tokens = await contract.getAllOnSale()
    assert.equal(tokens.length, 1)
  })
})
