import { Type } from '@sinclair/typebox'

const meSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  authSub: Type.String(),
  email: Type.String(),
  userName: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
})

export default meSchema
