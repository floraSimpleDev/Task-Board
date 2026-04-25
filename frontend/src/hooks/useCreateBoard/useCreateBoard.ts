import type { SWRMutationResponse } from 'swr/mutation'
import type z from 'zod'

import useResourceMutation from '@/hooks/useResourceMutation'
import boardSchema from '@/schemas/board'

type Board = z.infer<typeof boardSchema>

interface CreateBoardInput {
  title: string
}

const useCreateBoard = (): SWRMutationResponse<Board, Error, string, CreateBoardInput> =>
  useResourceMutation<typeof boardSchema, CreateBoardInput>({
    swrKey: '/boards',
    schema: boardSchema,
    buildRequest: (input) => ({ url: '/boards', method: 'POST', body: input }),
  })

export default useCreateBoard
