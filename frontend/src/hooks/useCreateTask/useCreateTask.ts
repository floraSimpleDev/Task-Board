import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'

import useAuthFetcher from '@/hooks/useAuthFetcher'
import taskSchema, { type Task } from '@/schemas/task/task'

interface CreateTaskInput {
  title: string
}

interface Props {
  boardId: string
  columnId: string
}

const useCreateTask = ({
  boardId,
  columnId,
}: Props): SWRMutationResponse<Task, Error, string, CreateTaskInput> => {
  const fetcher = useAuthFetcher(taskSchema)
  const key = `/boards/${boardId}`

  return useSWRMutation<Task, Error, string, CreateTaskInput>(
    key,
    async (_key, { arg }) =>
      fetcher(`/columns/${columnId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arg),
      }),
    { throwOnError: false }
  )
}

export default useCreateTask
