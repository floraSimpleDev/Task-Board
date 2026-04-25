import { type FC } from 'react'
import type z from 'zod'

import useBoard from '@/hooks/useBoard'
import useTaskActivities from '@/hooks/useTaskActivities'
import type taskActivitySchema from '@/schemas/taskActivity'

type TaskActivity = z.infer<typeof taskActivitySchema>

interface Props {
  boardId: string
  taskId: string
}

interface FieldChange<TValue> {
  from: TValue
  to: TValue
}

interface UpdatedChanges {
  title?: FieldChange<string>
  description?: FieldChange<string | null>
  priority?: FieldChange<'P0' | 'P1' | 'P2' | null>
}

interface MovedChanges {
  fromBoardColumnId: string
  toBoardColumnId: string
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const formatRelative = (iso: string): string => {
  const elapsedMs = Date.now() - new Date(iso).getTime()
  const elapsedMinutes = Math.round(elapsedMs / 60_000)
  if (elapsedMinutes < 1) {
    return 'just now'
  }
  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m ago`
  }
  const elapsedHours = Math.round(elapsedMinutes / 60)
  if (elapsedHours < 24) {
    return `${elapsedHours}h ago`
  }
  const elapsedDays = Math.round(elapsedHours / 24)
  return `${elapsedDays}d ago`
}

const renderUpdatedSummary = (changes: unknown): string => {
  if (!isObject(changes)) {
    return 'updated this task'
  }
  const fields = changes as UpdatedChanges
  const fieldNames = Object.keys(fields)
  if (fieldNames.length === 0) {
    return 'updated this task'
  }
  return `changed ${fieldNames.join(', ')}`
}

const renderMovedSummary = (changes: unknown, columnTitlesById: Map<string, string>): string => {
  if (!isObject(changes)) {
    return 'moved this task'
  }
  const moved = changes as Partial<MovedChanges>
  const fromTitle = moved.fromBoardColumnId
    ? (columnTitlesById.get(moved.fromBoardColumnId) ?? 'a column')
    : 'a column'
  const toTitle = moved.toBoardColumnId
    ? (columnTitlesById.get(moved.toBoardColumnId) ?? 'a column')
    : 'a column'
  return `moved from ${fromTitle} to ${toTitle}`
}

const renderSummary = (activity: TaskActivity, columnTitlesById: Map<string, string>): string => {
  if (activity.action === 'created') {
    return 'created this task'
  }
  if (activity.action === 'moved') {
    return renderMovedSummary(activity.changes, columnTitlesById)
  }
  return renderUpdatedSummary(activity.changes)
}

const TaskActivityList: FC<Props> = ({ boardId, taskId }) => {
  const { data: activities, isLoading: loadingActivities } = useTaskActivities(taskId)
  const { data: board } = useBoard(boardId)

  if (loadingActivities) {
    return <p className="text-muted-foreground text-xs">Loading activity…</p>
  }

  if (!activities || activities.length === 0) {
    return <p className="text-muted-foreground text-xs">No activity yet.</p>
  }

  const columnTitlesById = new Map<string, string>()
  if (board) {
    for (const column of board.columns) {
      columnTitlesById.set(column.id, column.title)
    }
  }

  return (
    <ul className="space-y-1.5">
      {activities.map((activity) => {
        const actor = activity.actorName ?? 'Someone'
        const summary = renderSummary(activity, columnTitlesById)
        return (
          <li key={activity.id} className="text-muted-foreground text-xs leading-snug">
            <span className="text-foreground font-medium">{actor}</span> {summary}{' '}
            <span className="opacity-70">· {formatRelative(activity.createdAt)}</span>
          </li>
        )
      })}
    </ul>
  )
}

export default TaskActivityList
