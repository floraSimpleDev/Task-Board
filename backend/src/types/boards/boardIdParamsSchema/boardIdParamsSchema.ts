import { Type } from '@sinclair/typebox'

const boardIdParamsSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
})

export default boardIdParamsSchema
