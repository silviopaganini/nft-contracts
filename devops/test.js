require('dotenv').config()
const argv = require('minimist')(process.argv.slice(2), { string: ['nfts'] })

const fs = require('fs')
const path = require('path')

const start = async callback => {
  try {
    const a = [{ a: 1, b: 2, c: 3 }]

    console.log(argv.nfts)

    const w = path.resolve(__dirname, '../', 'db.ts')
    const content = `export const tokenProps = ${JSON.stringify(a)}`

    await fs.writeFileSync(w, content)
    //file written successfully
    callback()
  } catch (e) {
    console.log(e)
    // throw new Error(e)
    callback(e)
  }
}

module.exports = start
