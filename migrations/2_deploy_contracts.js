const colors = require('colors')
const NFTT = artifacts.require('NFTT.sol')
const { deployProxy } = require('@openzeppelin/truffle-upgrades')

module.exports = async deployer => {
  const app = await deployProxy(NFTT, { deployer, initializer: 'initialize' })
  const owner = await app.owner()
  console.log(colors.grey(`NFTT contract owner: ${owner}`))
  console.log(colors.green('NFTT contract address:'))
  console.log(colors.yellow(app.address))
}
