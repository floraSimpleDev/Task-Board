import useSWR, { type SWRResponse } from 'swr'
import { z } from 'zod'

import useAuthFetcher from '@/hooks/useAuthFetcher'
import boardSchema from '@/schemas/board'
import columnSchema from '@/schemas/column'

const schema = boardSchema.extend({
  columns: z.array(columnSchema),
})

type BoardWithColumns = z.infer<typeof schema>

const useBoard = (boardId: string | undefined): SWRResponse<BoardWithColumns, Error> =>
  useSWR<BoardWithColumns, Error>(boardId ? `/boards/${boardId}` : null, useAuthFetcher(schema))

export default useBoard
