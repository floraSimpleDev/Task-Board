import type { SWRMutationResponse } from 'swr/mutation'
import type z from 'zod'

import useResourceMutation from '@/hooks/useResourceMutation'
import columnSchema from '@/schemas/column'

type Column = z.infer<typeof columnSchema>

interface CreateColumnInput {
  title: string
}

const useCreateColumn = (
  boardId: string
): SWRMutationResponse<Column, Error, string, CreateColumnInput> =>
  useResourceMutation<typeof columnSchema, CreateColumnInput>({
    swrKey: `/boards/${boardId}`,
    schema: columnSchema,
    buildRequest: (input) => ({
      url: `/boards/${boardId}/columns`,
      method: 'POST',
      body: input,
    }),
  })

export default useCreateColumn
