import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'

import useAuthFetcher from '@/hooks/useAuthFetcher'
import boardSchema, { type Board } from '@/schemas/board/board'

interface CreateBoardInput {
  title: string
}

const useCreateBoard = (): SWRMutationResponse<Board, Error, '/boards', CreateBoardInput> => {
  const fetcher = useAuthFetcher(boardSchema)

  return useSWRMutation<Board, Error, '/boards', CreateBoardInput>(
    '/boards',
    async (key, { arg }) =>
      fetcher(key, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg),
      }),
    { throwOnError: false }
  )
}

export default useCreateBoard
