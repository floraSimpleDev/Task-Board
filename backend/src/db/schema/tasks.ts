import { index, numeric, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { boardColumns } from './boardColumns'

export const taskPriority = pgEnum('task_priority', ['P0', 'P1', 'P2'])

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    boardColumnId: uuid('board_column_id')
      .notNull()
      .references(() => boardColumns.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    priority: taskPriority('priority'),
    position: numeric('position', { precision: 20, scale: 10 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [index('tasks_board_column_id_position_index').on(table.boardColumnId, table.position)]
)
