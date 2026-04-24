import { z } from 'zod'

import useAuthFetcher from '@/hooks/useAuthFetcher'
import useOptimisticBoardMutation from '@/hooks/useOptimisticBoardMutation'
import applyColumnOrder from '@/utils/boardPositioning/applyColumnOrder'

interface Props {
  boardId: string
}

type ReorderColumns = (columnIds: string[]) => Promise<void>

const useReorderColumns = ({ boardId }: Props): ReorderColumns => {
  const fetcher = useAuthFetcher(z.void())
  const mutateBoard = useOptimisticBoardMutation({ boardId })

  return async (columnIds) =>
    mutateBoard({
      sendRequest: async () => {
        await fetcher(`/boards/${boardId}/columns/reorder`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ columnIds }),
        })
      },
      applyOptimistic: (board) => applyColumnOrder(board, columnIds),
    })
}

export default useReorderColumns
