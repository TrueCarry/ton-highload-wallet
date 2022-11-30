import { SmartContract } from '@ton-community/tx-emulator'
import { BN } from 'bn.js'
import {
  Cell,
  CellMessage,
  CommonMessageInfo,
  contractAddress,
  ExternalMessage,
  Message,
} from 'ton'
import { mnemonicToWalletKey, sign } from 'ton-crypto'
import {
  buildHighloadWalletV2StateInit,
  HighloadWalletInitData,
  createHighloadWalletV2TransferMessage,
} from './HighloadWalletV2.data'

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
      // console.log('mneminic', mnemonic)
      const keyPair = await mnemonicToWalletKey(mnemonic)
      const walletInit: HighloadWalletInitData = {
        subwalletId: 0,
        publicKey: keyPair.publicKey,
      }
      const walletStateInit = buildHighloadWalletV2StateInit(walletInit)
      const highloadAddress = contractAddress({
        workchain: 0,
        initialCode: walletStateInit.code,
        initialData: walletStateInit.data,
      })

      const contract = SmartContract.fromState({
        address: highloadAddress,
        accountState: {
          type: 'uninit',
          // type: 'active',
          // code: walletStateInit.code,
          // data: walletStateInit.data,
        },
        balance: new BN('1000000000'),
      })

      const message = createHighloadWalletV2TransferMessage(walletInit, [
        {
          amount: new BN('10000000000'),
          body: new Cell(),
          destination: highloadAddress,
          mode: 0,
        },
        {
          amount: new BN('20000000'),
          body: new Cell(),
          destination: highloadAddress,
          mode: 0,
        },
      ])

      // const msgCell = new Cell()
      // // message.writeTo(msgCell)
      // message.body.body.writeTo(msgCell)

      // const signature = sign(msgCell.hash(), keyPair.secretKey)

      // const bodyCell = new Cell()
      // bodyCell.bits.writeBuffer(signature)
      // // message.writeTo(bodyCell)
      // message.body.body.writeTo(bodyCell)

      const res = await contract.sendMessage(
        signExternalMessage(keyPair.secretKey, message)
        // new ExternalMessage({
        //   to: highloadAddress,
        //   body: new CommonMessageInfo({
        //     body: new CellMessage(signBody(keyPair.secretKey, message.body.body)),
        //     // stateInit: stateInit,
        //   }),
        // })
      )
      console.log('send res', res, res.transaction.description)
    })
  })

  // describe('test 2', () => {
  //   throw new Error('wtf')
  // })
})

function signBody(key: Buffer, body: Message) {
  const msgCell = new Cell()
  // message.writeTo(msgCell)
  body.writeTo(msgCell)

  const signature = sign(msgCell.hash(), key)

  const bodyCell = new Cell()
  bodyCell.bits.writeBuffer(signature)
  // message.writeTo(bodyCell)
  body.writeTo(bodyCell)

  return bodyCell
}

function signExternalMessage(key: Buffer, message: ExternalMessage): ExternalMessage {
  const msgCell = new Cell()
  // message.writeTo(msgCell)
  message.body.body.writeTo(msgCell)

  const signature = sign(msgCell.hash(), key)

  const bodyCell = new Cell()
  bodyCell.bits.writeBuffer(signature)
  // message.writeTo(bodyCell)
  message.body.body.writeTo(bodyCell)

  // message.body.body = bodyCell

  return new ExternalMessage({
    ...message,
    body: new CommonMessageInfo({
      ...message.body,

      body: new CellMessage(bodyCell),
    }),
  })
}
