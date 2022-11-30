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
  // lastCleaned: number // uint 64
  publicKey: Buffer // bytes
}

export function buildHighloadWalletV2DataCell(data: HighloadWalletInitData): Cell {
  const dataCell = new Builder()

  dataCell.storeUint(data.subwalletId, 32)
  dataCell.storeUint(0, 64)
  dataCell.storeBuffer(data.publicKey)
  dataCell.storeDict(new DictBuilder(16).endDict())

  return dataCell.endCell()
}

export function buildHighloadWalletV2StateInit(data: HighloadWalletInitData): StateInit {
  const stateInit = new StateInit({
    code: HighloadWalletV2CodeCell,
    data: buildHighloadWalletV2DataCell(data),
  })

  return stateInit
}

export function generateHighloadWalletQueryId(timeout: number, randomId?: number) {
  const now = Math.floor(Date.now() / 1000)
  const random = randomId || Math.floor(Math.random() * 2 ** 30)

  return (BigInt(now + timeout) << 32n) | BigInt(random)
}

interface WalletTransfer {
  destination: Address
  amount: BN
  body: Cell
  mode: number
  state?: Cell
}

export function createHighloadWalletV2TransferMessage(
  data: HighloadWalletInitData,
  transfers: WalletTransfer[],
  _queryId?: bigint
) {
  if (!transfers.length || transfers.length > 254) {
    throw new Error('ContractHighloadWalletV2: can make only 1 to 100 transfers per operation.')
  }

  const queryId = _queryId || generateHighloadWalletQueryId(60)

  const dictBuilder = new DictBuilder(16)
  for (let i = 0; i < transfers.length; i++) {
    const v = transfers[i]
    const internal = new InternalMessage({
      to: v.destination,
      bounce: true, // TODO
      value: v.amount,
      body: new CommonMessageInfo({
        body: new CellMessage(v.body),
        stateInit: new CellMessage(v.state),
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
    .storeUint(this.subwalletId, 32)
    .storeUint(new BN(queryId.toString()), 64)
  body.storeDict(dictBuilder.endDict())

  const stateInit = buildHighloadWalletV2StateInit(data)
  const highloadAddress = contractAddress({
    workchain: 0,
    initialCode: stateInit.code,
    initialData: stateInit.data,
  })

  const msg = new ExternalMessage({
    to: highloadAddress,
    body: new CommonMessageInfo({
      body: new CellMessage(body.endCell()),
      stateInit: stateInit,
    }),
  })

  return msg
}
