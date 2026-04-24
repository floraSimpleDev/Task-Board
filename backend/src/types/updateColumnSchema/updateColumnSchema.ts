import { Type } from '@sinclair/typebox'

const updateColumnSchema = Type.Object({
  title: Type.Optional(Type.String({ minLength: 1, maxLength: 200 })),
  position: Type.Optional(Type.Integer({ minimum: 0 })),
})

export default updateColumnSchema
