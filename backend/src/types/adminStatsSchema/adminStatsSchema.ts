import { Type } from '@sinclair/typebox'

const adminStatsSchema = Type.Object({
  totalBoards: Type.Integer(),
})

export default adminStatsSchema
