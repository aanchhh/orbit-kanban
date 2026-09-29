import { useEffect, useState } from 'react'
import { CalendarDays, Clock3, Edit3, MessageCircle, Send, Trash2, X } from 'lucide-react'
import { dueState, formatDate, relativeTime } from '../lib/format'
import { STATUS_META, type Member, type Task } from '../types'
import { Avatar } from './AvatarStack'

export function TaskDrawer({ task, members, onClose, onEdit, onDelete, onComment }: { task: Task | null; members: Member[]; onClose: () => void; onEdit: () => void; onDelete: () => void; onComment: (body: string) => Promise<void> | void }) {
  const [comment, setComment] = useState('')
  useEffect(() => setComment(''), [task?.id])
  if (!task) return null
  const assigned = task.assignee_ids.map((id) => members.find((member) => member.id === id)).filter(Boolean) as Member[]
  const urgency = dueState(task)
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (!comment.trim()) return; await onComment(comment.trim()); setComment('') }
  return <div className="drawer-backdrop" onMouseDown={onClose}>
    <aside className="task-drawer" onMouseDown={(event) => event.stopPropagation()} aria-label={`Details for ${task.title}`}>
      <header className="drawer-header"><span className={`status-pill status-pill--${task.status}`}>{STATUS_META[task.status].label}</span><div><button className="icon-button" onClick={onEdit} aria-label="Edit"><Edit3 size={18} /></button><button className="icon-button icon-button--danger" onClick={onDelete} aria-label="Delete"><Trash2 size={18} /></button><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div></header>
      <div className="drawer-scroll">
        <section className="drawer-hero"><span className={`priority-label priority-label--${task.priority}`}>{task.priority} priority</span><h2>{task.title}</h2><p>{task.description || 'No description yet.'}</p></section>
        <div className="drawer-facts">
          <div><span>Due</span><strong className={`due-text due-text--${urgency}`}><CalendarDays size={16} />{task.due_date ? formatDate(`${task.due_date}T00:00:00`, { month: 'long', day: 'numeric', year: 'numeric' }) : 'No date'}</strong></div>
          <div><span>Assignees</span><strong>{assigned.length ? assigned.map((member) => <span className="assignee-name" key={member.id}><Avatar member={member} size="sm" />{member.name}</span>) : 'Unassigned'}</strong></div>
          <div><span>Labels</span><strong className="tag-row">{task.labels.length ? task.labels.map((label) => <span className="tag" key={label}>{label}</span>) : 'None'}</strong></div>
        </div>
        <section className="drawer-section"><h3><MessageCircle size={17} /> Conversation <span>{task.comments.length}</span></h3>
          <form className="comment-form" onSubmit={submit}><textarea rows={3} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a thoughtful update…" aria-label="New comment" /><button disabled={!comment.trim()} aria-label="Post comment"><Send size={16} /></button></form>
          <div className="comments">{task.comments.length ? task.comments.map((item) => <article className="comment" key={item.id}><span className="comment__avatar">Y</span><div><div><strong>You</strong><time>{relativeTime(item.created_at)}</time></div><p>{item.body}</p></div></article>) : <p className="quiet-state">No comments yet. Start the conversation.</p>}</div>
        </section>
        <section className="drawer-section"><h3><Clock3 size={17} /> Activity</h3><div className="timeline">{task.activity.map((item) => <div className="timeline__item" key={item.id}><span /><div><p>{item.detail}</p><time>{relativeTime(item.created_at)}</time></div></div>)}</div></section>
      </div>
    </aside>
  </div>
}

