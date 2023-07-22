import { Address } from 'ton'
import { external } from 'ton-core'
import { mnemonicToWalletKey } from 'ton-crypto'
import { Blockchain, SmartContract } from '@ton/sandbox'
import { ChildWallet, ChildWalletInitData } from './ChildWallet'

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
        const { wallet, blockchain, treasury } = await getStartWallet(10000000000n)
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
          2000000000n
        )

        const body = await treasury.createTransfer({
          sendMode: 1 + 2,
          messages: [message],
        })
        const msgExt = external({
          to: treasury.address,
          body: body,
        })
        // const msg = SignCell(keyPair.secretKey, message.body)
        // const tonBody = Cell.fromBoc(msg.toBoc())[0]

        // const msgExt = external({
        //   to: contract.address,
        //   body: tonBody,
        //   init: {
        //     ...message.init,
        //   },
        // })

        const res = await blockchain.sendMessage(msgExt)

        // const shardAccount = await blockchain.getContract(contract.address)
        //await contract.sendMessage(msgExt)
        console.log('logs', res.transactions[1].vmLogs)

        expect(res.transactions[1].outMessagesCount).toEqual(2)

        // const balanceBefore = 10000000000n
        // const fees = res.transactions[0].totalFees.coins
        // const balanceAfter = balanceBefore - fees - 1000000000n - 200000000n
        // expect(shardAccount.account.account.storage.balance.coins.toString()).toEqual(
        //   balanceAfter.toString()
        // )
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
  const blockchain = await Blockchain.create()
  const treasury = await blockchain.treasury('1')

  const keyPair = await mnemonicToWalletKey(mnemonic)
  const walletInit: ChildWalletInitData = {
    subwalletId: 0,
    workchain: 0,

    owner: treasury.address,
  }

  const wallet = new ChildWallet(walletInit)
  const contract = SmartContract.create(blockchain, {
    address: wallet.address,
    balance: startBalance,
    code: wallet.stateInit.code,
    data: wallet.stateInit.data,
  })

  blockchain.setShardAccount(contract.address, {
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
        balance: { coins: startBalance },
        state: {
          type: 'active',
          state: {
            code: wallet.stateInit.code,
            data: wallet.stateInit.data,
          },
        },
      },
    },
  })

  return { keyPair, wallet, contract, blockchain, treasury }
}
