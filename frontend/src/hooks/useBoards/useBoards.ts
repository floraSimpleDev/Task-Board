import useSWR, { type SWRResponse } from 'swr'
import { z } from 'zod'

import useAuthFetcher from '@/hooks/useAuthFetcher'
import boardSchema from '@/schemas/board'

const schema = z.array(boardSchema)
type Board = z.infer<typeof boardSchema>

const useBoards = (): SWRResponse<Board[], Error> =>
  useSWR<Board[], Error>('/boards', useAuthFetcher(schema))

export default useBoards
