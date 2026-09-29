import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { STATUS_META, STATUSES, type Member, type Status, type Task, type TaskDraft } from '../types'
import { Avatar } from './AvatarStack'

const EMPTY: TaskDraft = { title: '', description: '', status: 'todo', priority: 'normal', due_date: null, labels: [], assignee_ids: [] }

export function TaskModal({ open, task, initialStatus = 'todo', members, onClose, onSave }: { open: boolean; task: Task | null; initialStatus?: Status; members: Member[]; onClose: () => void; onSave: (draft: TaskDraft) => Promise<void> | void }) {
  const [draft, setDraft] = useState<TaskDraft>({ ...EMPTY, status: initialStatus })
  const [labels, setLabels] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (task) {
      const { title, description, status, priority, due_date, labels: nextLabels, assignee_ids } = task
      setDraft({ title, description, status, priority, due_date, labels: nextLabels, assignee_ids })
      setLabels(nextLabels.join(', '))
    } else {
      setDraft({ ...EMPTY, status: initialStatus })
      setLabels('')
    }
  }, [open, task, initialStatus])

  if (!open) return null
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!draft.title.trim()) return
    setSaving(true)
    await onSave({ ...draft, title: draft.title.trim(), labels: labels.split(',').map((label) => label.trim()).filter(Boolean) })
    setSaving(false); onClose()
  }
  return <div className="modal-backdrop" onMouseDown={onClose} role="presentation">
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title" onMouseDown={(event) => event.stopPropagation()}>
      <div className="modal__header"><div><span className="overline">{task ? 'Refine the work' : 'Capture the work'}</span><h2 id="task-modal-title">{task ? 'Edit task' : 'New task'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div>
      <form onSubmit={submit}>
        <label className="field"><span>Title</span><input autoFocus value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="What needs to move forward?" required /></label>
        <label className="field"><span>Description</span><textarea rows={4} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Add useful context, decisions, or a clear outcome…" /></label>
        <div className="field-grid">
          <label className="field"><span>Status</span><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Status })}>{STATUSES.map((status) => <option value={status} key={status}>{STATUS_META[status].label}</option>)}</select></label>
          <label className="field"><span>Priority</span><select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as TaskDraft['priority'] })}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option></select></label>
          <label className="field"><span>Due date</span><input type="date" value={draft.due_date ?? ''} onChange={(event) => setDraft({ ...draft, due_date: event.target.value || null })} /></label>
          <label className="field"><span>Labels</span><input value={labels} onChange={(event) => setLabels(event.target.value)} placeholder="Design, Launch" /></label>
        </div>
        {members.length > 0 && <fieldset className="assignee-picker"><legend>Assignees</legend><div>{members.map((member) => {
          const selected = draft.assignee_ids.includes(member.id)
          return <button type="button" key={member.id} className={selected ? 'selected' : ''} onClick={() => setDraft({ ...draft, assignee_ids: selected ? draft.assignee_ids.filter((id) => id !== member.id) : [...draft.assignee_ids, member.id] })}><Avatar member={member} size="sm" /><span>{member.name}</span>{selected && <Check size={14} />}</button>
        })}</div></fieldset>}
        <div className="modal__actions"><button type="button" className="button button--ghost" onClick={onClose}>Cancel</button><button className="button button--dark" disabled={saving || !draft.title.trim()}>{saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}</button></div>
      </form>
    </div>
  </div>
}

