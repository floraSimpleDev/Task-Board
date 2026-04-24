import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'
import { z } from 'zod'

import useAuthFetcher from '@/hooks/useAuthFetcher'

const useDeleteBoard = (): SWRMutationResponse<void, Error, '/boards', string> => {
  const fetcher = useAuthFetcher(z.void())

  return useSWRMutation<void, Error, '/boards', string>(
    '/boards',
    async (_key, { arg: boardId }) => fetcher(`/boards/${boardId}`, { method: 'DELETE' }),
    { throwOnError: false }
  )
}

export default useDeleteBoard
