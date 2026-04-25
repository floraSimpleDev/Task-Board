import type { SWRMutationResponse } from 'swr/mutation'
import type z from 'zod'

import useResourceMutation from '@/hooks/useResourceMutation'
import taskSchema from '@/schemas/task'

type Task = z.infer<typeof taskSchema>

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
}: Props): SWRMutationResponse<Task, Error, string, CreateTaskInput> =>
  useResourceMutation<typeof taskSchema, CreateTaskInput>({
    swrKey: `/boards/${boardId}`,
    schema: taskSchema,
    buildRequest: (input) => ({
      url: `/columns/${columnId}/tasks`,
      method: 'POST',
      body: input,
    }),
  })

export default useCreateTask
