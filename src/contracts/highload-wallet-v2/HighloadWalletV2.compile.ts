import { compileFunc } from '@ton-community/func-js'
import fs from 'fs'

async function main() {
  const stdlibCode = fs.readFileSync('./func/stdlib.fc', { encoding: 'utf8' })
  const walletCode = fs.readFileSync('./func/highload-wallet-v2-code.fc', { encoding: 'utf8' })

  const result = await compileFunc({
    entryPoints: ['stdlib.fc', 'highload-wallet-v2-code.fc'],
    sources: {
      'stdlib.fc': stdlibCode,
      'highload-wallet-v2-code.fc': walletCode,
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
}
main()
