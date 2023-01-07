import { SmartContract } from '@ton-community/tx-emulator'
import BN from 'bn.js'
import { SignCell } from 'src/utils/SignExternalMessage'
import { Address, Cell, CellMessage, CommonMessageInfo, ExternalMessage } from 'ton'
import { storeStateInit, beginCell as beginCellCore } from 'ton-core'
import { mnemonicToWalletKey } from 'ton-crypto'
import { HighloadWalletInitData } from '../../utils/HighloadWalletTypes'
import { HighloadWalletV2 } from './HighloadWalletV2'

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
      try {
        const { keyPair, wallet, contract } = await getStartWallet(new BN('10000000000'))
        const message = wallet.CreateTransferMessage(
          [
            {
              amount: BigInt('100000000'),
              destination: wallet.address,
              mode: 1,
            },
            {
              amount: BigInt('200000000'),
              destination: wallet.address,
              mode: 1,
            },
          ],
          2000000000n << 32n
        )

        const msg = SignCell(keyPair.secretKey, message.body)
        const tonBody = Cell.fromBoc(msg.toBoc())[0]
        const stateInitcell = Cell.fromBoc(
          beginCellCore().store(storeStateInit(message.init)).endCell().toBoc()
        )[0]

        const msgExt = new ExternalMessage({
          to: contract.getAddress(),
          body: new CommonMessageInfo({
            body: new CellMessage(tonBody),
            stateInit: new CellMessage(stateInitcell),
          }),
        })

        const res = await contract.sendMessage(msgExt)
        expect(res.shardAccount.account.storage.balance.coins.toString()).toEqual('9686545000')
        expect(res.transaction.outMessagesCount).toEqual(2)
      } catch (e) {
        console.log('er', e)
        throw e
      }
    })

    test('Sending more than we have should not work', async () => {
      const { keyPair, wallet, contract } = await getStartWallet(new BN('1000000000'))
      const message = wallet.CreateTransferMessage([
        {
          amount: BigInt('10000000000'),
          destination: wallet.address,
          mode: 1,
        },
        {
          amount: BigInt('20000000'),
          destination: wallet.address,
          mode: 1,
        },
      ])

      const msg = SignCell(keyPair.secretKey, message.body)
      const tonBody = Cell.fromBoc(msg.toBoc())[0]
      const stateInitcell = Cell.fromBoc(
        beginCellCore().store(storeStateInit(message.init)).endCell().toBoc()
      )[0]

      const msgExt = new ExternalMessage({
        to: contract.getAddress(),
        body: new CommonMessageInfo({
          body: new CellMessage(tonBody),
          stateInit: new CellMessage(stateInitcell),
        }),
      })

      const res = await contract.sendMessage(msgExt)

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
    address: Address.parse(highloadAddress.toRawString()),
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
