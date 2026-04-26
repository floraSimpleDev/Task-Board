import { Type } from '@sinclair/typebox'

const adminStatsSchema = Type.Object({
  totalUsers: Type.Integer(),
  totalBoards: Type.Integer(),
  totalTasks: Type.Integer(),
  totalActivities: Type.Integer(),
})

export default adminStatsSchema
