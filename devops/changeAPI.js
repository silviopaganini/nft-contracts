require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider')
const { ethers } = require('ethers')
const NFTT = artifacts.require('NFTT.sol')

const start = async callback => {
  try {
    const accounts = () =>
      new HDWalletProvider({
        mnemonic: process.env.KEY_MNEMONIC,
        providerOrUrl: process.env.WALLET_PROVIDER_URL,
      })

    const FROM = ethers.utils.getAddress(accounts().getAddresses()[0])
    const contract = await NFTT.deployed()

    const response = await contract.setBaseURI('https://api.nft.fluuu.id/prod/token', {
      from: FROM,
    })

    callback(response)
  } catch (e) {
    callback(e)
  }
}

module.exports = start
