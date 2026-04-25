import { Type } from '@sinclair/typebox'

const columnIdParamsSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
})

export default columnIdParamsSchema
