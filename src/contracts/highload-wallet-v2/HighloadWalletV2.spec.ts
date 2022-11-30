import { SmartContract } from '@ton-community/tx-emulator'
import BN from 'bn.js'
import { SignExternalMessage } from 'src/utils/SignExternalMessage'
import { Cell } from 'ton'
import { mnemonicToWalletKey } from 'ton-crypto'
import { HighloadWalletInitData, HighloadWalletV2 } from './HighloadWalletV2'

const mnemonic = [
  'special',
  'claw',
  'reward',
  'twice',
  'scale',
  'engage',
  'memory',
  'garage',
  'skill',
  'major',
  'book',
  'crack',
  'hospital',
  'genre',
  'staff',
  'deposit',
  'trend',
  'size',
  'worth',
  'offer',
  'dolphin',
  'dust',
  'raven',
  'welcome',
] //await mnemonicNew()

describe('HighloadWalletV2', () => {
  describe('Send single message', () => {
    test('Basic send', async () => {
      const { keyPair, wallet, contract } = await getStartWallet(new BN('1000000000'))
      const message = wallet.CreateTransferMessage([
        {
          amount: new BN('10000000'),
          body: new Cell(),
          destination: wallet.address,
          mode: 1,
        },
        {
          amount: new BN('20000000'),
          body: new Cell(),
          destination: wallet.address,
          mode: 1,
        },
      ])
      const res = await contract.sendMessage(SignExternalMessage(keyPair.secretKey, message))
      expect(res.shardAccount.account.storage.balance.coins.toString()).toEqual('956553000')
      expect(res.transaction.outMessagesCount).toEqual(2)
    })

    test('Sending more than we have should not work', async () => {
      const { keyPair, wallet, contract } = await getStartWallet(new BN('1000000000'))
      const message = wallet.CreateTransferMessage([
        {
          amount: new BN('10000000000'),
          body: new Cell(),
          destination: wallet.address,
          mode: 1,
        },
        {
          amount: new BN('20000000'),
          body: new Cell(),
          destination: wallet.address,
          mode: 1,
        },
      ])
      const res = await contract.sendMessage(SignExternalMessage(keyPair.secretKey, message))
      expect(res.transaction.outMessagesCount).toEqual(0)
      expect(res.transaction.description.type).toBe('generic')
      if (res.transaction.description.type !== 'generic') {
        return
      }
      expect(res.transaction.description.aborted).toBe(true)
    })
  })
})

async function getStartWallet(startBalance: BN) {
  const keyPair = await mnemonicToWalletKey(mnemonic)
  const walletInit: HighloadWalletInitData = {
    subwalletId: 0,
    publicKey: keyPair.publicKey,
    workchain: 0,
  }

  const wallet = new HighloadWalletV2(walletInit)

  const highloadAddress = wallet.address
  const contract = SmartContract.fromState({
    address: highloadAddress,
    accountState: {
      type: 'uninit',
      // type: 'active',
      // code: walletStateInit.code,
      // data: walletStateInit.data,
    },
    balance: startBalance,
  })

  return { keyPair, wallet, contract }
}
