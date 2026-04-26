const formatRelativeTime = (iso: string): string => {
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

export default formatRelativeTime
