import type { FC } from 'react'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import useBoards from '@/hooks/useBoards'

import CreateBoardDialog from './components/CreateBoardDialog'
import DeleteBoardDialog from './components/DeleteBoardDialog'
import Header from './components/Header'

const BoardsPage: FC = () => {
  const { data: boards, error, isLoading } = useBoards()

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your boards</h2>
          <CreateBoardDialog />
        </div>

        {isLoading && <p className="text-muted-foreground">Loading boards…</p>}

        {error && <p className="text-destructive">Failed to load boards: {error.message}</p>}

        {boards?.length === 0 && (
          <p className="text-muted-foreground">No boards yet. Create one to get started.</p>
        )}

        {boards?.length ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <li key={board.id}>
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 overflow-hidden">
                        <CardTitle className="truncate">{board.title}</CardTitle>
                        <CardDescription>
                          Created {new Date(board.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <DeleteBoardDialog boardId={board.id} boardTitle={board.title} />
                    </div>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ul>
        ) : null}
      </main>
    </div>
  )
}

export default BoardsPage
