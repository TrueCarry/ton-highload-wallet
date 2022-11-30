import { ExternalMessage, Cell, CommonMessageInfo, CellMessage } from 'ton'
import { sign } from 'ton-crypto'

export function SignExternalMessage(key: Buffer, message: ExternalMessage): ExternalMessage {
  const msgCell = new Cell()
  message.body.body.writeTo(msgCell)

  const signature = sign(msgCell.hash(), key)

  const bodyCell = new Cell()
  bodyCell.bits.writeBuffer(signature)
  message.body.body.writeTo(bodyCell)

  return new ExternalMessage({
    ...message,
    body: new CommonMessageInfo({
      ...message.body,

      body: new CellMessage(bodyCell),
    }),
  })
}
