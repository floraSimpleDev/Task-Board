import useSWR, { type SWRResponse } from 'swr'
import type { z } from 'zod'

import useAuthFetcher from '@/hooks/useAuthFetcher'
import boardWithColumnsSchema from '@/schemas/boardWithColumns'

type BoardWithColumns = z.infer<typeof boardWithColumnsSchema>

const useBoard = (boardId: string | undefined): SWRResponse<BoardWithColumns, Error> =>
  useSWR<BoardWithColumns, Error>(
    boardId ? `/boards/${boardId}` : null,
    useAuthFetcher(boardWithColumnsSchema)
  )

export default useBoard
