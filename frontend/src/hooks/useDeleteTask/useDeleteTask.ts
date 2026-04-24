import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'
import { z } from 'zod'

import useAuthFetcher from '@/hooks/useAuthFetcher'

interface Props {
  boardId: string
}

const useDeleteTask = ({ boardId }: Props): SWRMutationResponse<void, Error, string, string> => {
  const fetcher = useAuthFetcher(z.void())
  const key = `/boards/${boardId}`

  return useSWRMutation<void, Error, string, string>(
    key,
    async (_key, { arg: taskId }) => fetcher(`/tasks/${taskId}`, { method: 'DELETE' }),
    { throwOnError: false }
  )
}

export default useDeleteTask
