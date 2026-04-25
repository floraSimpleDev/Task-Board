import { eq } from 'drizzle-orm'

import { boardColumns, boards, tasks, users } from '@/db/schema'

import createDrizzleClient from './createDrizzleClient'

const SEED_AUTH_SUB = 'seed|demo-user'
const SEED_EMAIL = 'demo@task-board.local'
const SEED_USER_NAME = 'Demo User'
const POSITION_STEP = 1024

const seedBoards = [
  {
    title: 'Personal Tasks',
    columns: [
      {
        title: 'Backlog',
        tasks: [
          { title: 'Plan weekend trip', priority: 'P2' as const },
          { title: 'Renew library books', priority: 'P1' as const },
        ],
      },
      {
        title: 'In Progress',
        tasks: [{ title: 'Read "Designing Data-Intensive Applications"', priority: 'P2' as const }],
      },
      {
        title: 'Done',
        tasks: [{ title: 'Set up new laptop', priority: 'P1' as const }],
      },
    ],
  },
  {
    title: 'Task-Board Roadmap',
    columns: [
      {
        title: 'Todo',
        tasks: [
          {
            title: 'Add task search',
            description: 'Filter by title, priority, column.',
            priority: 'P1' as const,
          },
          {
            title: 'Real-time sync via websockets',
            description: 'Multi-user collaborative editing.',
            priority: 'P2' as const,
          },
        ],
      },
      {
        title: 'Doing',
        tasks: [
          {
            title: 'Deploy to Kubernetes',
            description: 'Manifests, management script, README.',
            priority: 'P0' as const,
          },
        ],
      },
      {
        title: 'Shipped',
        tasks: [
          { title: 'Drag-and-drop columns', priority: 'P1' as const },
          { title: 'Auth0 JWT auth', priority: 'P0' as const },
        ],
      },
    ],
  },
  {
    title: 'Bug Tracker',
    columns: [
      {
        title: 'Reported',
        tasks: [
          {
            title: 'Task description overflows on mobile',
            priority: 'P2' as const,
          },
        ],
      },
      { title: 'Triaged', tasks: [] },
      { title: 'Fixed', tasks: [] },
    ],
  },
]

const seed = async (): Promise<void> => {
  const { database, pool } = createDrizzleClient()

  await database.transaction(async (transaction) => {
    const [seedUser] = await transaction
      .insert(users)
      .values({
        authSub: SEED_AUTH_SUB,
        email: SEED_EMAIL,
        userName: SEED_USER_NAME,
      })
      .onConflictDoUpdate({
        target: users.authSub,
        set: { email: SEED_EMAIL, userName: SEED_USER_NAME },
      })
      .returning()

    await transaction.delete(boards).where(eq(boards.userId, seedUser.id))

    for (const boardSeed of seedBoards) {
      const [insertedBoard] = await transaction
        .insert(boards)
        .values({ userId: seedUser.id, title: boardSeed.title })
        .returning()

      for (const [columnIndex, columnSeed] of boardSeed.columns.entries()) {
        const [insertedColumn] = await transaction
          .insert(boardColumns)
          .values({
            boardId: insertedBoard.id,
            title: columnSeed.title,
            position: columnIndex,
          })
          .returning()

        if (columnSeed.tasks.length === 0) {
          continue
        }

        await transaction.insert(tasks).values(
          columnSeed.tasks.map((taskSeed, taskIndex) => ({
            boardColumnId: insertedColumn.id,
            title: taskSeed.title,
            description: 'description' in taskSeed ? taskSeed.description : null,
            priority: taskSeed.priority,
            position: (taskIndex + 1) * POSITION_STEP,
          }))
        )
      }
    }
  })

  await pool.end()
}

seed()
  .then(() => {
    process.stdout.write('Seed complete.\n')
    process.exit(0)
  })
  .catch((error: unknown) => {
    process.stderr.write(`Seed failed: ${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
  })
