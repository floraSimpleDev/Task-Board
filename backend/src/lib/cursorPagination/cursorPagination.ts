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

const decodeCursor = (token: string): Cursor | null => {
  try {
    const parsed = JSON.parse(Buffer.from(token, 'base64url').toString('utf8')) as unknown
    if (!Value.Check(cursorPayloadSchema, parsed)) {
      return null
    }
    const createdAt = new Date(parsed.createdAt)
    if (Number.isNaN(createdAt.getTime())) {
      return null
    }
    return { createdAt, id: parsed.id }
  } catch {
    return null
  }
}

export { decodeCursor, encodeCursor }
