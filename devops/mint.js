require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider')
const colors = require('colors')
const fetch = require('node-fetch')
const { utils, ethers } = require('ethers')
const NFTT = artifacts.require('NFTT.sol')
const path = require('path')
const fs = require('fs')

const { SERVICE_URL } = process.env

const start = async callback => {
  try {
    const objectsToBeMinted = []

    const currentTokens = await (await fetch(`${SERVICE_URL}/token`)).json()
    const currentIndex = currentTokens.length
    const AMOUNT = 30

    const accounts = () =>
      new HDWalletProvider({
        mnemonic: process.env.KEY_MNEMONIC,
        providerOrUrl: process.env.WALLET_PROVIDER_URL,
      })

    const FROM = ethers.utils.getAddress(accounts().getAddresses()[0])

    for (let i = currentIndex; i < currentIndex + AMOUNT; i++) {
      objectsToBeMinted.push(`Robot ${i}`)
    }

    const mintAssetsOnIPFS = await (
      await fetch(`${SERVICE_URL}/mint`, {
        method: 'POST',
        body: JSON.stringify({ objectsToBeMinted }),
      })
    ).json()

    const contract = await NFTT.deployed()
    const price = '1.5'

    const priceWei = utils.parseEther(price)
    const ipfsURLs = []

    const mintedTokens = await Promise.all(
      mintAssetsOnIPFS.map(async token => {
        ipfsURLs.push({
          name: token.name,
          image: `https://ipfs.io/ipfs/${token.path}`,
          description: `Description for ${token.name}`,
          external_url: 'https://s2paganini.com/',
        })
        return await contract.mintCollectable(FROM, token.path, token.name, priceWei, true, {
          from: FROM,
        })
      })
    )

    const content = `export const tokenProps = ${JSON.stringify([...currentTokens, ...ipfsURLs])}`

    const file = path.resolve(__dirname, '../', 'db.ts')
    await fs.writeFileSync(file, content)

    callback(colors.green(`⚡️ Tokens created: ${colors.white(mintedTokens.length)}`))
  } catch (e) {
    callback(e)
  }
}

module.exports = start
