import { eq } from 'drizzle-orm'

import type { Database } from '@/db/createDrizzleClient/createDrizzleClient'
import { tasks } from '@/db/schema/tasks'

const deleteTask = async (database: Database, taskId: string): Promise<boolean> => {
  const deleted = await database
    .delete(tasks)
    .where(eq(tasks.id, taskId))
    .returning({ id: tasks.id })

  return !!deleted.length
}

export default deleteTask
