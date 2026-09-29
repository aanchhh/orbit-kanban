import { useMemo, useState } from 'react'
import { DndContext, DragOverlay, PointerSensor, KeyboardSensor, closestCorners, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { AlertCircle, ArrowUpRight, CheckCircle2, ChevronDown, CircleDashed, Filter, LayoutGrid, Plus, RefreshCw, Search, Sparkles, Users, X } from 'lucide-react'
import { BoardColumn } from './components/BoardColumn'
import { PeoplePanel } from './components/PeoplePanel'
import { TaskCard } from './components/TaskCard'
import { TaskDrawer } from './components/TaskDrawer'
import { TaskModal } from './components/TaskModal'
import { useBoard } from './hooks/useBoard'
import { dueState } from './lib/format'
import { STATUSES, type Priority, type Status, type Task, type TaskDraft } from './types'

const ALL = 'all'

export default function App() {
  const board = useBoard()
  const [query, setQuery] = useState('')
  const [priority, setPriority] = useState<Priority | typeof ALL>(ALL)
  const [label, setLabel] = useState(ALL)
  const [showFilters, setShowFilters] = useState(false)
  const [showPeople, setShowPeople] = useState(false)
  const [modal, setModal] = useState<{ open: boolean; task: Task | null; status: Status }>({ open: false, task: null, status: 'todo' })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 7 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  const labels = useMemo(() => Array.from(new Set(board.tasks.flatMap((task) => task.labels))).sort(), [board.tasks])
  const filtered = useMemo(() => board.tasks.filter((task) => {
    const text = `${task.title} ${task.description} ${task.labels.join(' ')}`.toLowerCase()
    return text.includes(query.toLowerCase()) && (priority === ALL || task.priority === priority) && (label === ALL || task.labels.includes(label))
  }), [board.tasks, label, priority, query])
  const selected = board.tasks.find((task) => task.id === selectedId) ?? null
  const active = board.tasks.find((task) => task.id === activeId) ?? null
  const completed = board.tasks.filter((task) => task.status === 'done').length
  const overdue = board.tasks.filter((task) => dueState(task) === 'overdue').length
  const progress = board.tasks.length ? Math.round((completed / board.tasks.length) * 100) : 0

  const openNew = (status: Status = 'todo') => setModal({ open: true, task: null, status })
  const openEdit = (task: Task) => setModal({ open: true, task, status: task.status })
  const saveTask = async (draft: TaskDraft) => {
    if (modal.task) {
      const moved = draft.status !== modal.task.status
      await board.updateTask(modal.task.id, draft, moved ? `Moved from ${modal.task.status.replace('_', ' ')} to ${draft.status.replace('_', ' ')}` : 'Task details updated')
    } else await board.createTask(draft)
  }
  const dragEnd = async ({ active: dragActive, over }: DragEndEvent) => {
    setActiveId(null)
    if (!over) return
    const task = board.tasks.find((item) => item.id === dragActive.id)
    if (!task) return
    const overTask = board.tasks.find((item) => item.id === over.id)
    const status = (overTask?.status ?? over.id) as Status
    if (STATUSES.includes(status)) await board.moveTask(task.id, status)
  }
  const deleteSelected = async () => {
    if (!selected || !window.confirm(`Delete “${selected.title}”? This cannot be undone.`)) return
    await board.deleteTask(selected.id); setSelectedId(null)
  }
  const activeFilterCount = Number(priority !== ALL) + Number(label !== ALL)

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark"><span /></span><span><strong>ORBIT</strong><small>WORK IN MOTION</small></span></div>
      <div className="topbar__workspace"><span>Workspace</span><button>Studio OS <ChevronDown size={14} /></button></div>
      <div className="topbar__actions">
        {board.isDemo && <span className="demo-badge"><Sparkles size={13} /> Local demo</span>}
        <button className="icon-button people-trigger" onClick={() => setShowPeople((value) => !value)} aria-label="Team members"><Users size={18} /><span>{board.members.length}</span></button>
        <button className="button button--accent" onClick={() => openNew()}><Plus size={17} /> New task</button>
      </div>
      <PeoplePanel open={showPeople} members={board.members} onClose={() => setShowPeople(false)} onAdd={board.addMember} />
    </header>

    <main>
      <section className="page-intro">
        <div><span className="overline"><CircleDashed size={14} /> Project board / Q4 Launch</span><h1>Good work, in motion.</h1><p>A shared view of what matters now, what needs a nudge, and what just crossed the finish line.</p></div>
        <div className="summary-strip">
          <div><span>All work</span><strong>{board.tasks.length.toString().padStart(2, '0')}</strong></div>
          <div><span>Completed</span><strong>{completed.toString().padStart(2, '0')}</strong></div>
          <div><span>Overdue</span><strong className={overdue ? 'danger-text' : ''}>{overdue.toString().padStart(2, '0')}</strong></div>
          <div className="progress-stat"><span>Progress</span><strong>{progress}%</strong><i><b style={{ width: `${progress}%` }} /></i></div>
        </div>
      </section>

      <section className="toolbar">
        <div className="view-title"><LayoutGrid size={18} /><strong>Board</strong><span>{filtered.length} tasks</span></div>
        <div className="toolbar__controls">
          <label className="search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the board" />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={14} /></button>}</label>
          <div className="filter-wrap"><button className={`button button--outline ${activeFilterCount ? 'has-filter' : ''}`} onClick={() => setShowFilters((value) => !value)}><Filter size={16} /> Filter {activeFilterCount > 0 && <span>{activeFilterCount}</span>}</button>
            {showFilters && <div className="filter-popover">
              <label><span>Priority</span><select value={priority} onChange={(event) => setPriority(event.target.value as Priority | typeof ALL)}><option value={ALL}>All priorities</option><option value="high">High</option><option value="normal">Normal</option><option value="low">Low</option></select></label>
              <label><span>Label</span><select value={label} onChange={(event) => setLabel(event.target.value)}><option value={ALL}>All labels</option>{labels.map((item) => <option key={item}>{item}</option>)}</select></label>
              <button onClick={() => { setPriority(ALL); setLabel(ALL) }}>Clear filters</button>
            </div>}
          </div>
        </div>
      </section>

      {board.error && <div className="error-banner"><AlertCircle size={18} /><span><strong>Something went off course.</strong>{board.error}</span><button onClick={board.reload}><RefreshCw size={15} /> Try again</button></div>}

      {board.loading ? <div className="loading-board">{STATUSES.map((status) => <div key={status}><span /><span /><span /></div>)}</div> :
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={({ active: item }: DragStartEvent) => setActiveId(item.id as string)} onDragEnd={dragEnd} onDragCancel={() => setActiveId(null)}>
          <div className="board">{STATUSES.map((status) => <BoardColumn key={status} status={status} tasks={filtered.filter((task) => task.status === status).sort((a, b) => a.position - b.position)} members={board.members} onOpen={(task) => setSelectedId(task.id)} onAdd={openNew} />)}</div>
          <DragOverlay>{active && <TaskCard task={active} members={board.members} overlay />}</DragOverlay>
        </DndContext>}

      {board.isDemo && <section className="demo-note"><div><CheckCircle2 size={18} /><span><strong>Demo workspace</strong>Your changes are saved in this browser. Connect Supabase for private guest accounts and cloud persistence.</span></div><button onClick={board.resetDemo}>Reset sample data</button></section>}
    </main>

    <footer><span>ORBIT / STUDIO OS</span><a href="https://supabase.com" target="_blank" rel="noreferrer">Private by default <ArrowUpRight size={13} /></a></footer>

    <TaskModal open={modal.open} task={modal.task} initialStatus={modal.status} members={board.members} onClose={() => setModal((value) => ({ ...value, open: false }))} onSave={saveTask} />
    <TaskDrawer task={selected} members={board.members} onClose={() => setSelectedId(null)} onEdit={() => selected && openEdit(selected)} onDelete={deleteSelected} onComment={(body) => selected ? board.addComment(selected.id, body) : undefined} />
  </div>
}

