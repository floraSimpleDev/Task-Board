import { Type } from '@sinclair/typebox'

const adminBoardListSchema = Type.Array(
  Type.Object({
    id: Type.String({ format: 'uuid' }),
    title: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    ownerId: Type.String({ format: 'uuid' }),
    ownerUserName: Type.String(),
    ownerEmail: Type.String(),
  })
)

export default adminBoardListSchema
