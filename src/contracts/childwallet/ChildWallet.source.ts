import { Cell } from 'ton-core'

export const ChildWalletCodeBoc =
  'te6ccgEBBgEAWgABFP8A9KQT9LzyyAsBAgEgAgMCAUgEBQAE8jAAZNAB0NMDAXGw8kD6QDDtRND6QIAg1yHRxwXyo/gAkyDXSp7TB9QC+wAg10qT1DDQ3ugwABGhf3faiaH0gGM='

export const ChildWalletCodeCell = Cell.fromBoc(Buffer.from(ChildWalletCodeBoc, 'base64'))[0]
