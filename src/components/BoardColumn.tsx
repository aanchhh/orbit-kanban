import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { STATUS_META, type Member, type Status, type Task } from '../types'
import { TaskCard } from './TaskCard'

export function BoardColumn({ status, tasks, members, onOpen, onAdd }: { status: Status; tasks: Task[]; members: Member[]; onOpen: (task: Task) => void; onAdd: (status: Status) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { type: 'column', status } })
  const meta = STATUS_META[status]
  return (
    <section className={`board-column board-column--${status} ${isOver ? 'is-over' : ''}`} ref={setNodeRef}>
      <header className="column-header">
        <div><span className="column-header__eyebrow">{meta.eyebrow}</span><h2>{meta.label}</h2></div>
        <span className="column-count">{tasks.length.toString().padStart(2, '0')}</span>
      </header>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="column-tasks">
          {tasks.map((task) => <TaskCard key={task.id} task={task} members={members} onOpen={() => onOpen(task)} />)}
          {tasks.length === 0 && <div className="empty-column"><span>Clear horizon</span><p>Drop a task here or add something new.</p></div>}
        </div>
      </SortableContext>
      <button className="column-add" onClick={() => onAdd(status)}><Plus size={16} /> Add task</button>
    </section>
  )
}

