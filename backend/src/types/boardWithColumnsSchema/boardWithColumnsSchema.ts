import { Type } from '@sinclair/typebox'

import columnSchema from '@/types/columnSchema'

const boardWithColumnsSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userId: Type.String({ format: 'uuid' }),
  title: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
  columns: Type.Array(columnSchema),
})

export default boardWithColumnsSchema
