import type { FC } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import useBoard from '@/hooks/useBoard'

import ColumnCard from './components/ColumnCard'
import CreateColumnForm from './components/CreateColumnForm'

const BoardDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const { data: board, error, isLoading } = useBoard(id)

  if (!id) {
    return <Navigate to="/boards" replace />
  }

  return (
    <div>
      <div className="border-b p-4">
        <Link to="/boards" className="text-muted-foreground hover:text-foreground text-sm">
          ← All boards
        </Link>
        <h1 className="mt-1 text-2xl font-bold">{board?.title ?? 'Loading...'}</h1>
      </div>

      <main className="flex gap-4 overflow-x-auto p-6">
        {isLoading && <p className="text-muted-foreground">Loading board…</p>}

        {error && <p className="text-destructive">Failed to load board: {error.message}</p>}

        {board && (
          <>
            {board.columns.map((column) => (
              <ColumnCard key={column.id} boardId={board.id} column={column} />
            ))}
            <CreateColumnForm boardId={board.id} />
          </>
        )}
      </main>
    </div>
  )
}

export default BoardDetailPage
