import { useSWRConfig } from 'swr'
import type { z } from 'zod'

import type boardWithColumnsSchema from '@/schemas/boardWithColumns'

type BoardWithColumns = z.infer<typeof boardWithColumnsSchema>

interface Props {
  boardId: string
}

interface MutateArgs {
  sendRequest: () => Promise<unknown>
  applyOptimistic: (board: BoardWithColumns) => BoardWithColumns
}

const useOptimisticBoardMutation = ({ boardId }: Props) => {
  const { mutate } = useSWRConfig()
  const key = `/boards/${boardId}`

  return async ({ sendRequest, applyOptimistic }: MutateArgs): Promise<void> => {
    await mutate<BoardWithColumns>(
      key,
      async () => {
        await sendRequest()
      },
      {
        optimisticData: (current) => {
          if (!current) {
            throw new Error(`Cannot optimistically update board ${boardId}: not loaded`)
          }
          return applyOptimistic(current)
        },
        rollbackOnError: true,
        populateCache: false,
        revalidate: true,
      }
    )
  }
}

export default useOptimisticBoardMutation
