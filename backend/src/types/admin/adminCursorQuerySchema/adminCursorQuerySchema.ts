import { Type } from '@sinclair/typebox'

const adminCursorQuerySchema = Type.Object({
  cursor: Type.Optional(Type.String()),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 25 })),
})

export default adminCursorQuerySchema
