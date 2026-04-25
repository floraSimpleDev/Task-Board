import { index, jsonb, pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'

import { tasks } from './tasks'
import { users } from './users'

export const taskActivityAction = pgEnum('task_activity_action', ['created', 'updated', 'moved'])

export const taskActivities = pgTable(
  'task_activities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    action: taskActivityAction('action').notNull(),
    changes: jsonb('changes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('task_activities_task_id_created_at_index').on(table.taskId, table.createdAt)]
)
