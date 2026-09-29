import { useCallback, useEffect, useMemo, useState } from 'react'
import { seedMembers, seedTasks } from '../data/seed'
import { hasSupabaseConfig, supabase } from '../lib/supabase'
import { STATUS_META, type Activity, type Member, type Status, type Task, type TaskDraft } from '../types'

const STORAGE_KEY = 'orbit-board-v1'
const COLORS = ['#ff6b4a', '#4965f2', '#1f9d79', '#a855f7', '#d18b10']
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value))
const makeId = () => crypto.randomUUID()

type StoredBoard = { tasks: Task[]; members: Member[] }

function getDemoBoard(): StoredBoard {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value ? JSON.parse(value) : { tasks: clone(seedTasks), members: clone(seedMembers) }
  } catch {
    return { tasks: clone(seedTasks), members: clone(seedMembers) }
  }
}

function taskFromRow(row: Record<string, unknown>, comments: Task['comments'], activity: Activity[]): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? '',
    status: row.status as Status,
    priority: (row.priority as Task['priority']) ?? 'normal',
    due_date: (row.due_date as string | null) ?? null,
    labels: (row.labels as string[]) ?? [],
    assignee_ids: (row.assignee_ids as string[]) ?? [],
    position: Number(row.position ?? 0),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    comments,
    activity,
  }
}

export function useBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isDemo = !hasSupabaseConfig

  const saveDemo = useCallback((nextTasks: Task[], nextMembers = members) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks: nextTasks, members: nextMembers }))
  }, [members])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (!supabase) {
        const board = getDemoBoard()
        setTasks(board.tasks)
        setMembers(board.members)
        return
      }

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        const { error: authError } = await supabase.auth.signInAnonymously()
        if (authError) throw authError
      }
      const [taskResult, memberResult, commentResult, activityResult] = await Promise.all([
        supabase.from('tasks').select('*').order('position'),
        supabase.from('team_members').select('id,name,color,created_at').order('created_at'),
        supabase.from('comments').select('id,task_id,body,created_at').order('created_at'),
        supabase.from('task_activity').select('id,task_id,action,detail,created_at').order('created_at', { ascending: false }),
      ])
      const firstError = taskResult.error || memberResult.error || commentResult.error || activityResult.error
      if (firstError) throw firstError
      setMembers((memberResult.data ?? []) as Member[])
      setTasks((taskResult.data ?? []).map((row) => taskFromRow(
        row,
        (commentResult.data ?? []).filter((item) => item.task_id === row.id),
        (activityResult.data ?? []).filter((item) => item.task_id === row.id),
      )))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load the board.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const addActivity = useCallback(async (taskId: string, action: string, detail: string) => {
    const item: Activity = { id: makeId(), task_id: taskId, action, detail, created_at: new Date().toISOString() }
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, activity: [item, ...task.activity] } : task))
    if (supabase) await supabase.from('task_activity').insert({ task_id: taskId, action, detail })
    return item
  }, [])

  const createTask = useCallback(async (draft: TaskDraft) => {
    setError(null)
    const now = new Date().toISOString()
    const position = tasks.filter((task) => task.status === draft.status).length
    if (supabase) {
      const { data: userData } = await supabase.auth.getUser()
      const { data, error: createError } = await supabase.from('tasks').insert({ ...draft, position, user_id: userData.user?.id }).select().single()
      if (createError) { setError(createError.message); return }
      const created = taskFromRow(data, [], [])
      setTasks((current) => [...current, created])
      await addActivity(created.id, 'created', `Task added to ${STATUS_META[created.status].label}`)
      return created
    }
    const created: Task = { ...draft, id: makeId(), position, created_at: now, updated_at: now, comments: [], activity: [] }
    const activity: Activity = { id: makeId(), task_id: created.id, action: 'created', detail: `Task added to ${STATUS_META[created.status].label}`, created_at: now }
    created.activity = [activity]
    const next = [...tasks, created]
    setTasks(next); saveDemo(next)
    return created
  }, [addActivity, saveDemo, tasks])

  const updateTask = useCallback(async (id: string, draft: Partial<TaskDraft>, activityDetail = 'Task details updated') => {
    setError(null)
    const before = tasks.find((task) => task.id === id)
    if (!before) return
    const now = new Date().toISOString()
    const activity: Activity = { id: makeId(), task_id: id, action: draft.status && draft.status !== before.status ? 'moved' : 'updated', detail: activityDetail, created_at: now }
    const next = tasks.map((task) => task.id === id ? { ...task, ...draft, updated_at: now, activity: [activity, ...task.activity] } : task)
    setTasks(next)
    if (supabase) {
      const { error: updateError } = await supabase.from('tasks').update({ ...draft, updated_at: now }).eq('id', id)
      if (updateError) { setError(updateError.message); await load(); return }
      await supabase.from('task_activity').insert({ task_id: id, action: activity.action, detail: activity.detail })
    } else saveDemo(next)
  }, [load, saveDemo, tasks])

  const moveTask = useCallback(async (id: string, status: Status) => {
    const task = tasks.find((item) => item.id === id)
    if (!task || task.status === status) return
    const detail = `Moved from ${STATUS_META[task.status].label} to ${STATUS_META[status].label}`
    await updateTask(id, { status }, detail)
  }, [tasks, updateTask])

  const deleteTask = useCallback(async (id: string) => {
    const next = tasks.filter((task) => task.id !== id)
    setTasks(next)
    if (supabase) {
      const { error: deleteError } = await supabase.from('tasks').delete().eq('id', id)
      if (deleteError) { setError(deleteError.message); await load() }
    } else saveDemo(next)
  }, [load, saveDemo, tasks])

  const addComment = useCallback(async (taskId: string, body: string) => {
    const optimistic = { id: makeId(), task_id: taskId, body, created_at: new Date().toISOString() }
    let comment = optimistic
    if (supabase) {
      const { data, error: commentError } = await supabase.from('comments').insert({ task_id: taskId, body }).select().single()
      if (commentError) { setError(commentError.message); return }
      comment = data
    }
    const next = tasks.map((task) => task.id === taskId ? { ...task, comments: [...task.comments, comment] } : task)
    setTasks(next); if (!supabase) saveDemo(next)
  }, [saveDemo, tasks])

  const addMember = useCallback(async (name: string) => {
    const item = { id: makeId(), name, color: COLORS[members.length % COLORS.length], created_at: new Date().toISOString() }
    let member = item
    if (supabase) {
      const { data: userData } = await supabase.auth.getUser()
      const { data, error: memberError } = await supabase.from('team_members').insert({ name, color: item.color, owner_user_id: userData.user?.id }).select('id,name,color,created_at').single()
      if (memberError) { setError(memberError.message); return }
      member = data
    }
    const next = [...members, member]
    setMembers(next); if (!supabase) saveDemo(tasks, next)
  }, [members, saveDemo, tasks])

  const resetDemo = useCallback(() => {
    const nextTasks = clone(seedTasks); const nextMembers = clone(seedMembers)
    setTasks(nextTasks); setMembers(nextMembers); localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks: nextTasks, members: nextMembers }))
  }, [])

  return useMemo(() => ({ tasks, members, loading, error, isDemo, createTask, updateTask, moveTask, deleteTask, addComment, addMember, resetDemo, reload: load }), [tasks, members, loading, error, isDemo, createTask, updateTask, moveTask, deleteTask, addComment, addMember, resetDemo, load])
}
