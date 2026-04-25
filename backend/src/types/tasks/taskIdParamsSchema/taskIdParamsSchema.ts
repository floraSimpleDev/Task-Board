import { Type } from '@sinclair/typebox'

const taskIdParamsSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
})

export default taskIdParamsSchema
