import { Type } from '@sinclair/typebox'

const createTaskSchema = Type.Object({
  title: Type.String({ minLength: 1, maxLength: 500 }),
})

export default createTaskSchema
