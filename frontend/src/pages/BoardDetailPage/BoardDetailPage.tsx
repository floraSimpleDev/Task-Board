import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import type { FC } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import useBoard from '@/hooks/useBoard'
import useMoveTask from '@/hooks/useMoveTask'
import useReorderColumns from '@/hooks/useReorderColumns'

import ColumnCard from './components/ColumnCard'
import CreateColumnForm from './components/CreateColumnForm'
import SortableColumn from './components/SortableColumn'
import useBoardDnd from './hooks/useBoardDnd'

const BoardDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const { data: board, error, isLoading } = useBoard(id)
  const reorderColumns = useReorderColumns({ boardId: id ?? '' })
  const moveTask = useMoveTask({ boardId: id ?? '' })

  const { sensors, activeDrag, handleDragStart, handleDragEnd, handleDragCancel } = useBoardDnd({
    board,
    onReorderColumns: (columnIds) => {
      void reorderColumns(columnIds)
    },
    onMoveTask: (move) => {
      void moveTask(move)
    },
  })

  if (!id) {
    return <Navigate to="/boards" replace />
  }

  const draggedColumn =
    activeDrag?.type === 'column'
      ? board?.columns.find((column) => column.id === activeDrag.columnId)
      : undefined

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={board.columns.map((column) => column.id)}
              strategy={horizontalListSortingStrategy}
            >
              {board.columns.map((column) => (
                <SortableColumn key={column.id} columnId={column.id}>
                  {(dragHandleProps) => (
                    <ColumnCard
                      boardId={board.id}
                      column={column}
                      dragHandleProps={dragHandleProps}
                    />
                  )}
                </SortableColumn>
              ))}
            </SortableContext>
            <CreateColumnForm boardId={board.id} />
            <DragOverlay>
              {draggedColumn && <ColumnCard boardId={board.id} column={draggedColumn} />}
            </DragOverlay>
          </DndContext>
        )}
      </main>
    </div>
  )
}

export default BoardDetailPage
