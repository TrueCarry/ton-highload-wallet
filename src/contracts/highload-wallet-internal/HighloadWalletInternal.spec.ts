import { SmartContract } from '@ton-community/tx-emulator'
import BN from 'bn.js'
import { SignExternalMessage, SignInternalMessage } from 'src/utils/SignExternalMessage'
import { InternalMessage } from 'ton'
import { mnemonicToWalletKey } from 'ton-crypto'
import { HighloadWalletInitData, HighloadWalletInternal } from './HighloadWalletInternal'

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

describe('HighloadWalletInternal', () => {
  describe('Send single message', () => {
    test('Basic send', async () => {
      const startBalance = new BN('10000000000')
      const send1Amount = new BN('100000000')
      const send2Amount = new BN('200000000')

      const { keyPair, wallet, contract } = await getStartWallet(startBalance)
      const message = wallet.CreateTransferMessage([
        {
          amount: send1Amount,
          destination: wallet.address,
          mode: 1,
        },
        {
          amount: send2Amount,
          destination: wallet.address,
          mode: 1,
        },
      ])

      const res = await contract.sendMessage(SignExternalMessage(keyPair.secretKey, message))
      expect(
        res.shardAccount.account.storage.balance.coins.lt(
          startBalance.sub(send1Amount).sub(send2Amount)
        )
      ).toEqual(true)
      expect(
        res.shardAccount.account.storage.balance.coins.gt(
          startBalance.sub(send1Amount).sub(send2Amount).sub(new BN('100000000'))
        )
      ).toEqual(true)
      expect(res.transaction.outMessagesCount).toEqual(2)
    })

    test('Basic Internal send', async () => {
      const startBalance = new BN('10000000000')
      const send1Amount = new BN('100000000')
      const send2Amount = new BN('200000000')

      try {
        const { keyPair, wallet, contract } = await getStartWallet(new BN(0))
        const body = wallet.CreateTransferBody([
          {
            amount: send1Amount,
            destination: wallet.address,
            mode: 1,
          },
          {
            amount: send2Amount,
            destination: wallet.address,
            mode: 1,
          },
        ])

        const internalMessage = new InternalMessage({
          to: wallet.address,
          value: startBalance,
          bounce: false,
          body: body,
          from: wallet.address,
        })

        const res = await contract.sendMessage(
          SignInternalMessage(keyPair.secretKey, internalMessage)
        )
        expect(
          res.shardAccount.account.storage.balance.coins.lt(
            startBalance.sub(send1Amount).sub(send2Amount)
          )
        ).toEqual(true)
        expect(
          res.shardAccount.account.storage.balance.coins.gt(
            startBalance.sub(send1Amount).sub(send2Amount).sub(new BN('100000000'))
          )
        ).toEqual(true)
        expect(res.transaction.outMessagesCount).toEqual(2)
      } catch (e) {
        console.log('catch error', e)
        throw e
      }
    })

    test('Sending more than we have should not work', async () => {
      const { keyPair, wallet, contract } = await getStartWallet(new BN('1000000000'))
      const message = wallet.CreateTransferMessage([
        {
          amount: new BN('10000000000'),
          destination: wallet.address,
          mode: 1,
        },
        {
          amount: new BN('20000000'),
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

  const wallet = new HighloadWalletInternal(walletInit)

  const highloadAddress = wallet.address
  const contract = SmartContract.fromState({
    address: highloadAddress,
    accountState: {
      type: 'uninit',
      // type: 'active',
      // code: wallet.stateInit.code,
      // data: wallet.stateInit.data,
    },
    balance: startBalance,
  })

  return { keyPair, wallet, contract }
}
