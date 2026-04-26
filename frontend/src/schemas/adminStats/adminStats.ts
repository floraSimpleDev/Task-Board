import { z } from 'zod'

const adminStatsSchema = z.object({
  totalUsers: z.number().int(),
  totalBoards: z.number().int(),
  totalTasks: z.number().int(),
  totalActivities: z.number().int(),
})

export default adminStatsSchema
