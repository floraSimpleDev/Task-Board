import { Type } from '@sinclair/typebox'

import columnWithTasksSchema from '@/types/columns/columnWithTasksSchema'

const boardWithColumnsSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userId: Type.String({ format: 'uuid' }),
  title: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
  columns: Type.Array(columnWithTasksSchema),
})

export default boardWithColumnsSchema
