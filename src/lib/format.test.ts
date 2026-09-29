import { describe, expect, it } from 'vitest'
import { dueState } from './format'

describe('dueState', () => {
  it('ignores completed work', () => {
    expect(dueState({ due_date: '2000-01-01', status: 'done' })).toBe('none')
  })

  it('marks past work overdue', () => {
    expect(dueState({ due_date: '2000-01-01', status: 'todo' })).toBe('overdue')
  })
})

