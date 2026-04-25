import { Type } from '@sinclair/typebox'

const createColumnSchema = Type.Object({
  title: Type.String({ minLength: 1, maxLength: 200 }),
})

export default createColumnSchema
