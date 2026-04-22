import { Type } from '@sinclair/typebox'

const healthSchema = Type.Object({
  status: Type.String(),
})

export default healthSchema
