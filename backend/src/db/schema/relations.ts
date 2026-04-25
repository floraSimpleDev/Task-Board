import { relations } from 'drizzle-orm'

import { boardColumns } from './boardColumns'
import { boards } from './boards'
import { taskActivities } from './taskActivities'
import { tasks } from './tasks'
import { users } from './users'

export const usersRelations = relations(users, ({ many }) => ({
  boards: many(boards),
  taskActivities: many(taskActivities),
}))

export const boardsRelations = relations(boards, ({ one, many }) => ({
  user: one(users, {
    fields: [boards.userId],
    references: [users.id],
  }),
  columns: many(boardColumns),
}))

export const boardColumnsRelations = relations(boardColumns, ({ one, many }) => ({
  board: one(boards, {
    fields: [boardColumns.boardId],
    references: [boards.id],
  }),
  tasks: many(tasks),
}))

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  column: one(boardColumns, {
    fields: [tasks.boardColumnId],
    references: [boardColumns.id],
  }),
  activities: many(taskActivities),
}))

export const taskActivitiesRelations = relations(taskActivities, ({ one }) => ({
  task: one(tasks, {
    fields: [taskActivities.taskId],
    references: [tasks.id],
  }),
  actor: one(users, {
    fields: [taskActivities.actorId],
    references: [users.id],
  }),
}))
