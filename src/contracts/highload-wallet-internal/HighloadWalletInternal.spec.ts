// import { SmartContract } from '@ton-community/tx-emulator'
// import { SignCell } from 'src/utils/SignExternalMessage'
// import {
//   Address,
//   Cell,
//   CellMessage,
//   CommonMessageInfo,
//   ExternalMessage,
//   InternalMessage,
// } from 'ton'
// import { mnemonicToWalletKey } from 'ton-crypto'
// import { beginCell as beginCellCore, storeStateInit } from 'ton-core'
// import { HighloadWalletInternal } from './HighloadWalletInternal'
// import { HighloadWalletInitData } from '../../utils/HighloadWalletTypes'

// const mnemonic = [
//   'special',
//   'claw',
//   'reward',
//   'twice',
//   'scale',
//   'engage',
//   'memory',
//   'garage',
//   'skill',
//   'major',
//   'book',
//   'crack',
//   'hospital',
//   'genre',
//   'staff',
//   'deposit',
//   'trend',
//   'size',
//   'worth',
//   'offer',
//   'dolphin',
//   'dust',
//   'raven',
//   'welcome',
// ] //await mnemonicNew()

// describe('HighloadWalletInternal', () => {
//   describe('Send single message', () => {
//     test('Basic send', async () => {
//       const startBalance = 10000000000n
//       const send1Amount = 100000000n
//       const send2Amount = 200000000n

//       const { keyPair, wallet, contract } = await getStartWallet(new BN(startBalance.toString()))
//       const message = wallet.CreateTransferMessage([
//         {
//           amount: send1Amount,
//           destination: wallet.address,
//           mode: 1,
//         },
//         {
//           amount: send2Amount,
//           destination: wallet.address,
//           mode: 1,
//         },
//       ])

//       const msg = SignCell(keyPair.secretKey, message.body)
//       const tonBody = Cell.fromBoc(msg.toBoc())[0]
//       const stateInitcell = Cell.fromBoc(
//         beginCellCore().store(storeStateInit(message.init)).endCell().toBoc()
//       )[0]

//       const msgExt = new ExternalMessage({
//         to: contract.getAddress(),
//         body: new CommonMessageInfo({
//           body: new CellMessage(tonBody),
//           stateInit: new CellMessage(stateInitcell),
//         }),
//       })

//       const res = await contract.sendMessage(msgExt)

//       // const res = await contract.sendMessage(SignExternalMessage(keyPair.secretKey, message))
//       expect(
//         res.shardAccount.account.storage.balance.coins.lt(
//           new BN((startBalance - send1Amount - send2Amount).toString())
//         )
//       ).toEqual(true)
//       expect(
//         res.shardAccount.account.storage.balance.coins.gt(
//           new BN((startBalance - send1Amount - send2Amount - 100000000n).toString())
//         )
//       ).toEqual(true)
//       expect(res.transaction.outMessagesCount).toEqual(2)
//     })

//     test('Basic Internal send', async () => {
//       const startBalance = 10000000000n
//       const send1Amount = 100000000n
//       // const send2Amount = 200000000n

//       try {
//         const { keyPair, wallet, contract } = await getStartWallet(new BN(0))
//         const body = wallet.CreateTransferBody([
//           {
//             amount: send1Amount,
//             destination: wallet.address,
//             mode: 1,
//           },
//           // {
//           //   amount: send2Amount,
//           //   destination: wallet.address,
//           //   mode: 1,
//           // },
//         ])

//         const signed = SignCell(keyPair.secretKey, body)
//         const signedTonCell = Cell.fromBoc(signed.toBoc())[0]
//         const stateInitcell = Cell.fromBoc(
//           beginCellCore().store(storeStateInit(wallet.stateInit)).endCell().toBoc()
//         )[0]

//         const internalMessage = new InternalMessage({
//           to: Address.parse(wallet.address.toRawString()),
//           value: new BN(startBalance.toString()),
//           bounce: false,
//           // body: new CosignedTonCell,
//           body: new CommonMessageInfo({
//             body: new CellMessage(signedTonCell),
//             stateInit: new CellMessage(stateInitcell),
//           }),
//           from: Address.parse(wallet.address.toRawString()),
//         })

//         const res = await contract.sendMessage(internalMessage)
//         // expect(
//         //   res.shardAccount.account.storage.balance.coins.lt(
//         //     startBalance.sub(send1Amount).sub(send2Amount)
//         //   )
//         // ).toEqual(true)
//         // expect(
//         //   res.shardAccount.account.storage.balance.coins.gt(
//         //     startBalance.sub(send1Amount).sub(send2Amount).sub(new BN('100000000'))
//         //   )
//         // ).toEqual(true)
//         expect(res.transaction.outMessagesCount).toEqual(1)
//       } catch (e) {
//         console.log('catch error', e)
//         throw e
//       }
//     })

//     test('Sending more than we have should not work', async () => {
//       const { keyPair, wallet, contract } = await getStartWallet(new BN('1000000000'))
//       const message = wallet.CreateTransferMessage([
//         {
//           amount: 10000000000n,
//           destination: wallet.address,
//           mode: 1,
//         },
//         {
//           amount: 20000000n,
//           destination: wallet.address,
//           mode: 1,
//         },
//       ])

//       const msg = SignCell(keyPair.secretKey, message.body)
//       const tonBody = Cell.fromBoc(msg.toBoc())[0]
//       const stateInitcell = Cell.fromBoc(
//         beginCellCore().store(storeStateInit(message.init)).endCell().toBoc()
//       )[0]

//       const msgExt = new ExternalMessage({
//         to: contract.getAddress(),
//         body: new CommonMessageInfo({
//           body: new CellMessage(tonBody),
//           stateInit: new CellMessage(stateInitcell),
//         }),
//       })

//       const res = await contract.sendMessage(msgExt)
//       expect(res.transaction.outMessagesCount).toEqual(0)
//       expect(res.transaction.description.type).toBe('generic')
//       if (res.transaction.description.type !== 'generic') {
//         return
//       }
//       expect(res.transaction.description.aborted).toBe(true)
//     })

//     test('Empty internal message', async () => {
//       const send1Amount = new BN('100000000')

//       try {
//         const { wallet, contract } = await getStartWallet(new BN(0))

//         const internalMessage = new InternalMessage({
//           to: Address.parse(wallet.address.toRawString()),
//           value: send1Amount,
//           bounce: false,
//           body: new CommonMessageInfo({
//             body: new CellMessage(new Cell()),
//           }),
//           from: Address.parse(wallet.address.toRawString()),
//         })

//         const res = await contract.sendMessage(internalMessage)
//         expect(res.transaction.description.type).toEqual('generic')
//         if (res.transaction.description.type !== 'generic') {
//           throw new Error()
//         }
//         if (res.transaction.description.computePhase.type !== 'computed') {
//           throw new Error()
//         }
//         expect(res.transaction.description.computePhase.exitCode).toEqual(0)
//       } catch (e) {
//         console.log('catch error', e)
//         throw e
//       }
//     })
//   })
// })

// async function getStartWallet(startBalance: BN) {
//   const keyPair = await mnemonicToWalletKey(mnemonic)
//   const walletInit: HighloadWalletInitData = {
//     subwalletId: 0,
//     publicKey: keyPair.publicKey,
//     workchain: 0,
//   }

//   const wallet = new HighloadWalletInternal(walletInit)

//   const highloadAddress = wallet.address
//   const contract = SmartContract.fromState({
//     address: Address.parse(highloadAddress.toRawString()),
//     accountState: {
//       // type: 'uninit',
//       type: 'active',
//       code: Cell.fromBoc(wallet.stateInit.code.toBoc())[0],
//       data: Cell.fromBoc(wallet.stateInit.data.toBoc())[0],
//     },
//     balance: startBalance,
//   })

//   return { keyPair, wallet, contract }
// }
