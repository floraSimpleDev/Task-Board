import useAuthFetcher from '@/hooks/useAuthFetcher'
import useOptimisticBoardMutation from '@/hooks/useOptimisticBoardMutation'
import taskSchema from '@/schemas/task'
import applyTaskMove from '@/utils/boardPositioning/applyTaskMove'

interface Props {
  boardId: string
}

interface MoveTaskInput {
  taskId: string
  targetColumnId: string
  position: number
}

type MoveTask = (input: MoveTaskInput) => Promise<void>

const useMoveTask = ({ boardId }: Props): MoveTask => {
  const fetcher = useAuthFetcher(taskSchema)
  const mutateBoard = useOptimisticBoardMutation({ boardId })

  return async ({ taskId, targetColumnId, position }) =>
    mutateBoard({
      sendRequest: async () => {
        await fetcher(`/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ position, boardColumnId: targetColumnId }),
        })
      },
      applyOptimistic: (board) => applyTaskMove(board, taskId, targetColumnId, position),
    })
}

export default useMoveTask
