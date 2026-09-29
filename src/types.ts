export const STATUSES = ['todo', 'in_progress', 'in_review', 'done'] as const
export type Status = (typeof STATUSES)[number]
export type Priority = 'low' | 'normal' | 'high'

export interface Member {
  id: string
  name: string
  color: string
  created_at: string
}

export interface Comment {
  id: string
  task_id: string
  body: string
  created_at: string
}

export interface Activity {
  id: string
  task_id: string
  action: string
  detail: string
  created_at: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  due_date: string | null
  labels: string[]
  assignee_ids: string[]
  position: number
  created_at: string
  updated_at: string
  comments: Comment[]
  activity: Activity[]
}

export type TaskDraft = Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'due_date' | 'labels' | 'assignee_ids'>

export const STATUS_META: Record<Status, { label: string; eyebrow: string }> = {
  todo: { label: 'To do', eyebrow: 'Queue' },
  in_progress: { label: 'In progress', eyebrow: 'Making' },
  in_review: { label: 'In review', eyebrow: 'Polishing' },
  done: { label: 'Done', eyebrow: 'Shipped' },
}

