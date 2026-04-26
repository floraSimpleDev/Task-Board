import { Type } from '@sinclair/typebox'

const adminUserListSchema = Type.Array(
  Type.Object({
    id: Type.String({ format: 'uuid' }),
    email: Type.String(),
    userName: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
  })
)

export default adminUserListSchema
