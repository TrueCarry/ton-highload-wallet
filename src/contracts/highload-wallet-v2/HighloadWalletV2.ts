import {
  Address,
  Builder,
  Cell,
  CellMessage,
  CommonMessageInfo,
  contractAddress,
  DictBuilder,
  ExternalMessage,
  InternalMessage,
  StateInit,
} from 'ton'
import BN from 'bn.js'
import { HighloadWalletV2CodeCell } from './HighloadWalletV2.source'

export interface HighloadWalletInitData {
  subwalletId: number // uint 32
  publicKey: Buffer // bytes
  workchain: number
}

export interface WalletTransfer {
  destination: Address
  amount: BN
  body: Cell
  mode: number
  state?: Cell
}

export class HighloadWalletV2 {
  data: HighloadWalletInitData

  constructor(data: HighloadWalletInitData) {
    this.data = data
  }

  get address() {
    const walletStateInit = this.stateInit
    const highloadAddress = contractAddress({
      workchain: this.data.workchain,
      initialCode: walletStateInit.code,
      initialData: walletStateInit.data,
    })

    return highloadAddress
  }

  get stateInit() {
    const walletStateInit = HighloadWalletV2.BuildStateInit(this.data)
    return walletStateInit
  }

  static BuildDataCell(data: HighloadWalletInitData): Cell {
    const dataCell = new Builder()

    dataCell.storeUint(data.subwalletId, 32)
    dataCell.storeUint(0, 64)
    dataCell.storeBuffer(data.publicKey)
    dataCell.storeDict(new DictBuilder(16).endDict())

    return dataCell.endCell()
  }

  static BuildStateInit(data: HighloadWalletInitData): StateInit {
    const stateInit = new StateInit({
      code: HighloadWalletV2CodeCell,
      data: HighloadWalletV2.BuildDataCell(data),
    })

    return stateInit
  }

  static GenerateQueryId(timeout: number, randomId?: number) {
    const now = Math.floor(Date.now() / 1000)
    const random = randomId || Math.floor(Math.random() * 2 ** 30)

    return (BigInt(now + timeout) << 32n) | BigInt(random)
  }

  CreateTransferMessage(transfers: WalletTransfer[], _queryId?: bigint): ExternalMessage {
    if (!transfers.length || transfers.length > 254) {
      throw new Error('ContractHighloadWalletV2: can make only 1 to 254 transfers per operation.')
    }

    const queryId = _queryId || HighloadWalletV2.GenerateQueryId(60)

    const dictBuilder = new DictBuilder(16)
    for (let i = 0; i < transfers.length; i++) {
      const v = transfers[i]
      const internal = new InternalMessage({
        to: v.destination,
        bounce: true, // TODO
        value: v.amount,
        body: new CommonMessageInfo({
          body: new CellMessage(v.body),
          stateInit: v.state ? new CellMessage(v.state) : null,
        }),
      })

      const internalCell = new Cell()
      internal.writeTo(internalCell)

      const bodyCell = new Builder()
        .storeUint(v.mode, 8) // send mode
        .storeRef(internalCell)
        .endCell()

      dictBuilder.storeCell(i, bodyCell)
    }

    const body = new Builder()
      .storeUint(this.data.subwalletId, 32)
      .storeUint(new BN(queryId.toString()), 64)
    body.storeDict(dictBuilder.endDict())

    const msg = new ExternalMessage({
      to: this.address,
      body: new CommonMessageInfo({
        body: new CellMessage(body.endCell()),
        stateInit: this.stateInit,
      }),
    })

    return msg
  }
}
