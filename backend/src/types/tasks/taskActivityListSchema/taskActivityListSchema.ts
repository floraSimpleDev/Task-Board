import { Type } from '@sinclair/typebox'

import taskActivitySchema from '@/types/tasks/taskActivitySchema'

const taskActivityListSchema = Type.Array(taskActivitySchema)

export default taskActivityListSchema
