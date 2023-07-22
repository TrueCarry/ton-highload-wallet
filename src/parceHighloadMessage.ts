import { Cell, Dictionary } from 'ton-core'
import { HighloadDictionaryMessageValue } from './utils/HighloadMessageDictionary'

async function main() {
  const body = Cell.fromBase64(
    'te6cckECGQEAA20AAZlb4nKBw/egVVIP31CVytuKxkbwFC47mYG7brfhqcjqZIL7BDbCXu2JXGXIKZyGbTfH7e05hyoUIWowUys2qOwOAAAAAWRGnBkWeNwmwAECAs0LAgIBIAYDAQNAGAQBamIAOnyiMRMjSJUz32YyNA5JrwlayNnHGM5rlJZcIYkWWKKpBMUzwAAAAAAAAAAAAAAAAAABBQClX8w9FAAAAAAAAAAAgAW/q86Zs5oLdwxi21NR7aMnzm9v08C8r/uFILYyW/hmEAIlOSF3VbbDO2RU2n92woGm/ZIihRagjLMjuZCttKuP8HMS0AgCASAJBwEDAGAIAWpiABCHfi9TH7LJOZMQGoUKUR/hPETi1Jt3X+pCr8MFJinCKKejWCAAAAAAAAAAAAAAAAAAARUBAwBgCgFqYgBhikbnAxDqx8yu2e/zy+V2U4RhjWFO6FgnNdWmrDYMnCino1ggAAAAAAAAAAAAAAAAAAEVAgEgEgwCASAPDQEDAGAOAWpiAH6ciOGNCg7gMncxdAb5XAq1jBvIah2rbUYnakbuWEfaKKejWCAAAAAAAAAAAAAAAAAAARUBAwBgEAFqYgBgLnytAwfwZRcm5Al1VoCGe+KEtVtu1IybL6M7LZUnbyino1ggAAAAAAAAAAAAAAAAAAERAKVfzD0UAAAAAAAAAACAHChK5YI4jUkZJcNWcSxniDuM8WZ+Zsv5/Wu6SR3B4nvQABPAQ6Vmn+NQmDL5Bcq1yG6ZFQWmdR+prCocOWgBKP1McxLQCAIBIBYTAQMAYBQBamIAUxEahljE9c0Tn1oPyZzZCAbe2kd2yYFAZa7+zcHHisIop6NYIAAAAAAAAAAAAAAAAAABFQClX8w9FAAAAAAAAAAAgBwoSuWCOI1JGSXDVnEsZ4g7jPFmfmbL+f1rukkdweJ70AIlOSF3VbbDO2RU2n92woGm/ZIihRagjLMjuZCttKuP8HMS0AgBAwBgFwFqYgABX3eCoPbNI16r6/oaPY1qemRDoyEhPJ6VT6pR7rMXKCkExTPAAAAAAAAAAAAAAAAAAAEYAKVfzD0UAAAAAAAAAACAF7PxYHuOFMRIkkOjHIdpOSPmxis0nZsWYuDaq4lx0RRwAiU5IXdVtsM7ZFTaf3bCgab9kiKFFqCMsyO5kK20q4/wcxLQCD822As='
  ).asSlice()

  const subwalletId = body.loadUint(32)
  const queryId = body.loadUint(64)
  const messages = body.loadDict(Dictionary.Keys.Int(16), HighloadDictionaryMessageValue)

  console.log('body', subwalletId, queryId)

  for (const [_, message] of messages) {
    console.log(
      'message',
      message.sendMode,
      message.message.info.dest,
      message.message.info.type === 'internal' && message.message.info.value
    )
  }
}

main()
