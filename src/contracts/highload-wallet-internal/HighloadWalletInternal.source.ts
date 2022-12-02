import { Cell } from 'ton'

export const HighloadWalletInternalCodeBoc =
  'te6ccgEBCwEA8gABFP8A9KQT9LzyyAsBAgEgAgMCAUgEBQAG8vABAgLPBgcCASAJCgAJGwx8AGAB6SDCNcYINMf0z/4I6ofUyC58mPtRNDTH9M/0//0BNFTYIBA9A5voTHyYFFzuvKiB/kBVBCH+RDyowL0BNH4AH+OFiGAEPR4b6UgmALTB9QwAfsAkTLiAbPmW4MlochANIBA9EOK5jEByMsfE8s/y//0AMntVIAgANCCAQPSWb6VsEiCUMFMDud4gkzM2AZJsIeKzABe9nOdqJoaa+Y64X/wAQb5fl2omhpj5jpn+n/mPoCaKkQQCB6BzfQmMktv8ld0fFA=='

export const HighloadWalletInternalCodeCell = Cell.fromBoc(
  Buffer.from(HighloadWalletInternalCodeBoc, 'base64')
)[0]
