import { integer, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'

import { boards } from './boards'

export const boardColumns = pgTable(
  'board_columns',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    boardId: uuid('board_id')
      .notNull()
      .references(() => boards.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    position: integer('position').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [unique('board_columns_board_id_position_key').on(table.boardId, table.position)]
)
