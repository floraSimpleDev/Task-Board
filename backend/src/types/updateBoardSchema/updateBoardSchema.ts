import { Type } from '@sinclair/typebox'

const updateBoardSchema = Type.Object({
  title: Type.String({ minLength: 1, maxLength: 200 }),
})

export default updateBoardSchema
