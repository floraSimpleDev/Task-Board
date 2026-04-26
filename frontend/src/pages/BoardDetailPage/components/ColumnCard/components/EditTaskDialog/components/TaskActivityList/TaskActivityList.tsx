import { type FC } from 'react'

import useBoard from '@/hooks/useBoard'
import useTaskActivities from '@/hooks/useTaskActivities'
import formatRelativeTime from '@/utils/formatRelativeTime'
import renderActivitySummary from '@/utils/renderActivitySummary'

interface Props {
  boardId: string
  taskId: string
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
        const summary = renderActivitySummary(activity, columnTitlesById)
        return (
          <li key={activity.id} className="text-muted-foreground text-xs leading-snug">
            <span className="text-foreground font-medium">{actor}</span> {summary}{' '}
            <span className="opacity-70">· {formatRelativeTime(activity.createdAt)}</span>
          </li>
        )
      })}
    </ul>
  )
}

export default TaskActivityList
