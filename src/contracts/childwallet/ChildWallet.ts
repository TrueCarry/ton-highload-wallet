import {
  Address,
  beginCell,
  Builder,
  Cell,
  contractAddress,
  internal,
  loadStateInit,
  MessageRelaxed,
  StateInit,
  storeMessageRelaxed,
} from 'ton-core'
import { WalletTransfer } from '../../utils/HighloadWalletTypes'
import { ChildWalletCodeCell } from './ChildWallet.source'

export interface ChildWalletInitData {
  owner: Address
  subwalletId: number // uint 32

  workchain: number
}

export class ChildWallet {
  data: ChildWalletInitData

  constructor(data: ChildWalletInitData) {
    this.data = data
  }

  get address() {
    const highloadAddress = contractAddress(this.data.workchain, this.stateInit)
    return highloadAddress
  }

  get stateInit() {
    const walletStateInit = ChildWallet.BuildStateInit(this.data)
    return walletStateInit
  }

  static BuildDataCell(data: ChildWalletInitData): Cell {
    const dataCell = new Builder()

    dataCell.storeAddress(data.owner)
    dataCell.storeUint(data.subwalletId, 32)

    return dataCell.endCell()
  }

  static BuildStateInit(data: ChildWalletInitData): StateInit {
    const stateInit = {
      code: ChildWalletCodeCell,
      data: ChildWallet.BuildDataCell(data),
    }

    return stateInit
  }

  CreateTransferMessage(transfers: WalletTransfer[], totalValue: bigint): MessageRelaxed {
    if (!transfers.length || transfers.length > 254) {
      throw new Error('ContractHighloadWalletV2: can make only 1 to 254 transfers per operation.')
    }

    let snakeCell: Builder | null = null

    for (let i = transfers.length - 1; i >= 0; i--) {
      const newCell = beginCell()
      const v = transfers[i]
      const internalMsg = internal({
        to: v.destination,
        bounce: v.bounce || false,
        value: v.amount,
        body: v.body,
      })
      if (v.state) {
        internalMsg.init = loadStateInit(v.state.asSlice())
      }

      newCell.storeUint(v.mode, 8)
      newCell.storeRef(beginCell().store(storeMessageRelaxed(internalMsg)).endCell())
      if (snakeCell) {
        newCell.storeRef(snakeCell)
      }
      snakeCell = newCell
    }

    const msg = internal({
      to: this.address,
      body: snakeCell.endCell(),
      init: this.stateInit,
      value: totalValue,
    })

    return msg
  }
}
