import type { Task } from '../types'

export function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en', options ?? { month: 'short', day: 'numeric' }).format(new Date(value))
}

export function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime()
  const mins = Math.max(1, Math.floor(diff / 60_000))
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function dueState(task: Pick<Task, 'due_date' | 'status'>) {
  if (!task.due_date || task.status === 'done') return 'none'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(`${task.due_date}T00:00:00`)
  const days = Math.ceil((due.getTime() - today.getTime()) / 86_400_000)
  if (days < 0) return 'overdue'
  if (days <= 2) return 'soon'
  return 'normal'
}

