import { SignCell } from 'src/utils/SignExternalMessage'
import { Address, Cell } from 'ton'
import { external } from 'ton-core'
import { mnemonicToWalletKey } from 'ton-crypto'
import { Blockchain, SmartContract } from '@ton/sandbox'
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
        const emptyAddress = new Address(
          0,
          Buffer.from([
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0,
          ])
        )
        const { keyPair, wallet, contract, blockchain } = await getStartWallet(10000000000n)
        const message = wallet.CreateTransferMessage(
          [
            {
              amount: BigInt('1000000000'),
              destination: emptyAddress,
              mode: 1,
            },
            {
              amount: BigInt('200000000'),
              destination: emptyAddress,
              mode: 1,
            },
          ],
          2000000000n << 32n
        )

        const msg = SignCell(keyPair.secretKey, message.body)
        const tonBody = Cell.fromBoc(msg.toBoc())[0]

        const msgExt = external({
          to: contract.address,
          body: tonBody,
          init: {
            ...message.init,
          },
        })

        blockchain.setShardAccount(wallet.address, {
          lastTransactionHash: BigInt('0x0'),
          lastTransactionLt: 0n,
          account: {
            addr: wallet.address,
            storageStats: {
              used: {
                cells: 0n,
                bits: 0n,
                publicCells: 0n,
              },
              lastPaid: 0,
              duePayment: null,
            },
            storage: {
              lastTransLt: 0n,
              balance: { coins: 10000000000n },
              state: {
                type: 'active',
                state: {
                  code: wallet.stateInit.code,
                  data: wallet.stateInit.data,
                  // ...wallet.stateInit,
                },
              },
            },
          },
        })
        const res = await blockchain.sendMessage(msgExt)

        expect(res.transactions[0].outMessagesCount).toEqual(2)
      } catch (e) {
        console.log('er', e)
        throw e
      }
    })

    // test('Sending more than we have should not work', async () => {
    //   const { keyPair, wallet, contract } = await getStartWallet(new BN('1000000000'))
    //   const message = wallet.CreateTransferMessage([
    //     {
    //       amount: BigInt('10000000000'),
    //       destination: wallet.address,
    //       mode: 1,
    //     },
    //     {
    //       amount: BigInt('20000000'),
    //       destination: wallet.address,
    //       mode: 1,
    //     },
    //   ])

    //   const msg = SignCell(keyPair.secretKey, message.body)
    //   const tonBody = Cell.fromBoc(msg.toBoc())[0]
    //   const stateInitcell = Cell.fromBoc(
    //     beginCellCore().store(storeStateInit(message.init)).endCell().toBoc()
    //   )[0]

    //   const msgExt = new ExternalMessage({
    //     to: contract.getAddress(),
    //     body: new CommonMessageInfo({
    //       body: new CellMessage(tonBody),
    //       stateInit: new CellMessage(stateInitcell),
    //     }),
    //   })

    //   const res = await contract.sendMessage(msgExt)

    //   expect(res.transaction.outMessagesCount).toEqual(0)
    //   expect(res.transaction.description.type).toBe('generic')
    //   if (res.transaction.description.type !== 'generic') {
    //     return
    //   }
    //   expect(res.transaction.description.aborted).toBe(true)
    // })
  })
})

async function getStartWallet(startBalance: bigint) {
  const keyPair = await mnemonicToWalletKey(mnemonic)
  const walletInit: HighloadWalletInitData = {
    subwalletId: 0,
    publicKey: keyPair.publicKey,
    workchain: 0,
  }

  const blockchain = await Blockchain.create()

  const wallet = new HighloadWalletV2(walletInit)
  const contract = SmartContract.create(blockchain, {
    address: wallet.address,
    balance: startBalance,
    code: wallet.stateInit.code,
    data: wallet.stateInit.data,
  })

  return { keyPair, wallet, contract, blockchain }
}
