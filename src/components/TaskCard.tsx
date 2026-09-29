import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CalendarDays, GripVertical, MessageCircle } from 'lucide-react'
import { dueState, formatDate } from '../lib/format'
import type { Member, Task } from '../types'
import { AvatarStack } from './AvatarStack'

export function TaskCard({ task, members, onOpen, overlay = false }: { task: Task; members: Member[]; onOpen?: () => void; overlay?: boolean }) {
  const sortable = useSortable({ id: task.id, data: { type: 'task', task } })
  const urgency = dueState(task)
  const style = { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition }
  return (
    <article
      ref={sortable.setNodeRef}
      style={style}
      className={`task-card ${sortable.isDragging ? 'is-dragging' : ''} ${overlay ? 'is-overlay' : ''}`}
      onClick={onOpen}
      tabIndex={0}
      onKeyDown={(event) => { if ((event.key === 'Enter' || event.key === ' ') && onOpen) onOpen() }}
      aria-label={`${task.title}, ${task.priority} priority`}
    >
      <button className="drag-handle" {...sortable.attributes} {...sortable.listeners} onClick={(event) => event.stopPropagation()} aria-label={`Move ${task.title}`}>
        <GripVertical size={16} />
      </button>
      <div className="task-card__top">
        <span className={`priority-dot priority-dot--${task.priority}`} />
        <span className="task-card__priority">{task.priority}</span>
      </div>
      <h3>{task.title}</h3>
      {task.labels.length > 0 && <div className="tag-row">{task.labels.slice(0, 3).map((label) => <span className="tag" key={label}>{label}</span>)}</div>}
      <div className="task-card__footer">
        <div className="task-card__meta">
          {task.due_date && <span className={`due due--${urgency}`}><CalendarDays size={14} />{formatDate(`${task.due_date}T00:00:00`)}</span>}
          {task.comments.length > 0 && <span className="comment-count"><MessageCircle size={14} />{task.comments.length}</span>}
        </div>
        <AvatarStack ids={task.assignee_ids} members={members} />
      </div>
    </article>
  )
}

