import { Type } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

interface Cursor {
  createdAt: Date
  id: string
}

const cursorPayloadSchema = Type.Object({
  createdAt: Type.String({ format: 'date-time' }),
  id: Type.String({ format: 'uuid' }),
})

const encodeCursor = ({ createdAt, id }: Cursor): string =>
  Buffer.from(JSON.stringify({ createdAt: createdAt.toISOString(), id })).toString('base64url')

const decodeCursor = (token: string | undefined): Cursor | undefined => {
  if (!token) {
    return undefined
  }
  try {
    const payload = Value.Decode(
      cursorPayloadSchema,
      JSON.parse(Buffer.from(token, 'base64url').toString('utf8'))
    )
    const createdAt = new Date(payload.createdAt)
    return Number.isNaN(createdAt.getTime()) ? undefined : { createdAt, id: payload.id }
  } catch {
    return undefined
  }
}

export { decodeCursor, encodeCursor }
