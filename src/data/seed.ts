import type { Member, Task } from '../types'

const now = new Date()
const iso = (offset: number) => new Date(now.getTime() + offset * 86_400_000).toISOString().slice(0, 10)
const timestamp = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3_600_000).toISOString()

export const seedMembers: Member[] = [
  { id: 'm-1', name: 'Maya Chen', color: '#ff6b4a', created_at: timestamp(72) },
  { id: 'm-2', name: 'Noah Williams', color: '#4965f2', created_at: timestamp(70) },
  { id: 'm-3', name: 'Iris Okafor', color: '#1f9d79', created_at: timestamp(68) },
]

export const seedTasks: Task[] = [
  {
    id: 't-1', title: 'Shape the launch narrative', description: 'Turn customer interviews into a crisp story for the fall release.',
    status: 'todo', priority: 'high', due_date: iso(1), labels: ['Strategy', 'Launch'], assignee_ids: ['m-1'], position: 0,
    created_at: timestamp(54), updated_at: timestamp(4),
    comments: [{ id: 'c-1', task_id: 't-1', body: 'I added the strongest interview quotes to the research folder.', created_at: timestamp(3) }],
    activity: [{ id: 'a-1', task_id: 't-1', action: 'created', detail: 'Task added to To do', created_at: timestamp(54) }],
  },
  {
    id: 't-2', title: 'Audit the onboarding flow', description: 'Find the three moments where new teams hesitate or drop.',
    status: 'todo', priority: 'normal', due_date: iso(5), labels: ['Research'], assignee_ids: ['m-3'], position: 1,
    created_at: timestamp(46), updated_at: timestamp(20), comments: [],
    activity: [{ id: 'a-2', task_id: 't-2', action: 'created', detail: 'Task added to To do', created_at: timestamp(46) }],
  },
  {
    id: 't-3', title: 'Build campaign landing page', description: 'Implement the responsive page and connect the waitlist form.',
    status: 'in_progress', priority: 'high', due_date: iso(-1), labels: ['Web', 'Launch'], assignee_ids: ['m-2', 'm-1'], position: 0,
    created_at: timestamp(90), updated_at: timestamp(2), comments: [],
    activity: [
      { id: 'a-3', task_id: 't-3', action: 'created', detail: 'Task added to To do', created_at: timestamp(90) },
      { id: 'a-4', task_id: 't-3', action: 'moved', detail: 'Moved from To do to In progress', created_at: timestamp(28) },
    ],
  },
  {
    id: 't-4', title: 'Refine empty states', description: 'Write concise, helpful prompts for every zero-data view.',
    status: 'in_progress', priority: 'low', due_date: iso(8), labels: ['Design', 'Copy'], assignee_ids: ['m-1'], position: 1,
    created_at: timestamp(35), updated_at: timestamp(8), comments: [],
    activity: [{ id: 'a-5', task_id: 't-4', action: 'created', detail: 'Task added to In progress', created_at: timestamp(35) }],
  },
  {
    id: 't-5', title: 'QA billing handoff', description: 'Run the upgrade, downgrade, and cancellation paths on mobile.',
    status: 'in_review', priority: 'normal', due_date: iso(2), labels: ['QA'], assignee_ids: ['m-3', 'm-2'], position: 0,
    created_at: timestamp(62), updated_at: timestamp(1), comments: [],
    activity: [{ id: 'a-6', task_id: 't-5', action: 'moved', detail: 'Moved from In progress to In review', created_at: timestamp(1) }],
  },
  {
    id: 't-6', title: 'Publish September changelog', description: 'A visual recap of the improvements shipped this month.',
    status: 'done', priority: 'normal', due_date: iso(-3), labels: ['Copy', 'Launch'], assignee_ids: ['m-1'], position: 0,
    created_at: timestamp(110), updated_at: timestamp(12), comments: [],
    activity: [{ id: 'a-7', task_id: 't-6', action: 'moved', detail: 'Moved from In review to Done', created_at: timestamp(12) }],
  },
]

