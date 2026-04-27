import { Type } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

interface Cursor {
  createdAt: Date
  id: string
}

const cursorPayloadSchema = Type.Object({
  createdAt: Type.String(),
  id: Type.String(),
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

const buildPaginatedResult = <TRow extends Cursor>(
  rows: TRow[],
  limit: number
): {
  items: (Omit<TRow, 'createdAt'> & { createdAt: string })[]
  nextCursor: string | null
} => {
  const hasMore = rows.length > limit
  const trimmed = hasMore ? rows.slice(0, limit) : rows
  const lastItem = trimmed.at(-1)
  const items = trimmed.map(({ createdAt, ...rest }) => ({
    ...rest,
    createdAt: createdAt.toISOString(),
  }))
  return {
    items,
    nextCursor: hasMore && lastItem ? encodeCursor(lastItem) : null,
  }
}

export { buildPaginatedResult, decodeCursor, encodeCursor }
