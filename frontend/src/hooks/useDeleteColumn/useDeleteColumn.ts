import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'
import { z } from 'zod'

import useAuthFetcher from '@/hooks/useAuthFetcher'

const useDeleteColumn = (boardId: string): SWRMutationResponse<void, Error, string, string> => {
  const fetcher = useAuthFetcher(z.void())
  const key = `/boards/${boardId}`

  return useSWRMutation<void, Error, string, string>(
    key,
    async (_key, { arg: columnId }) => fetcher(`/columns/${columnId}`, { method: 'DELETE' }),
    { throwOnError: false }
  )
}

export default useDeleteColumn
