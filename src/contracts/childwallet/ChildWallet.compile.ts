import { compileFunc } from '@ton-community/func-js'
import fs from 'fs'

async function main() {
  const stdlibCode = fs.readFileSync('./func/stdlib.fc', { encoding: 'utf8' })
  const walletCode = fs.readFileSync('./func/childwallet.fc', { encoding: 'utf8' })

  const result = await compileFunc({
    targets: ['stdlib.fc', 'childwallet.fc'],
    sources: {
      'stdlib.fc': stdlibCode,
      'childwallet.fc': walletCode,
    },
  })

  if (result.status === 'error') {
    console.error(result.message)
    return
  }

  if (result.status !== 'ok') {
    throw new Error('Result status not ok')
  }

  console.log('Code Base64:')
  console.log(result.codeBoc)
  const codeBuffer = Buffer.from(result.codeBoc, 'base64')

  console.log('Code HEX:')
  console.log(codeBuffer.toString('hex').toUpperCase())

  // return Cell.fromBase64(result.codeBoc)

  const srcFile = fs.readFileSync('./src/contracts/childwallet/ChildWallet.source.ts', {
    encoding: 'utf8',
  })
  const replaced = srcFile.replace(
    /export const ChildWalletCodeBoc =\n {2}'(.+)'/,
    `export const ChildWalletCodeBoc =\n  '${result.codeBoc}'`
  )
  fs.writeFileSync('./src/contracts/childwallet/ChildWallet.source.ts', replaced)
}
main()
