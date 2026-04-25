import { Type } from '@sinclair/typebox'

import boardSchema from '@/types/boards/boardSchema'

const boardListSchema = Type.Array(boardSchema)

export default boardListSchema
