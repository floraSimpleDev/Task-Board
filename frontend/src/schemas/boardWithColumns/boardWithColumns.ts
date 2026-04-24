import { z } from 'zod'

import boardSchema from '@/schemas/board'
import columnSchema from '@/schemas/column'
import taskSchema from '@/schemas/task'

const boardWithColumnsSchema = boardSchema.extend({
  columns: z.array(
    columnSchema.extend({
      tasks: z.array(taskSchema),
    })
  ),
})

export default boardWithColumnsSchema
