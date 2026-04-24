import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'

import useAuthFetcher from '@/hooks/useAuthFetcher'
import columnSchema, { type Column } from '@/schemas/column/column'

interface CreateColumnInput {
  title: string
}

const useCreateColumn = (
  boardId: string
): SWRMutationResponse<Column, Error, string, CreateColumnInput> => {
  const fetcher = useAuthFetcher(columnSchema)
  const key = `/boards/${boardId}`

  return useSWRMutation<Column, Error, string, CreateColumnInput>(
    key,
    async (_key, { arg }) =>
      fetcher(`/boards/${boardId}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg),
      }),
    { throwOnError: false }
  )
}

export default useCreateColumn
