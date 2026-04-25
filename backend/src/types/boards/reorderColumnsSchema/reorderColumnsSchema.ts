import { Type } from '@sinclair/typebox'

const reorderColumnsSchema = Type.Object({
  columnIds: Type.Array(Type.String({ format: 'uuid' }), { minItems: 1 }),
})

export default reorderColumnsSchema
