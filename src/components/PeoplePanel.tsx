import { useState } from 'react'
import { Plus, Users, X } from 'lucide-react'
import type { Member } from '../types'
import { Avatar } from './AvatarStack'

export function PeoplePanel({ open, members, onClose, onAdd }: { open: boolean; members: Member[]; onClose: () => void; onAdd: (name: string) => Promise<void> | void }) {
  const [name, setName] = useState('')
  if (!open) return null
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (!name.trim()) return; await onAdd(name.trim()); setName('') }
  return <div className="people-popover">
    <header><div><span className="overline">Workspace</span><h3><Users size={17} /> People</h3></div><button className="icon-button" onClick={onClose}><X size={18} /></button></header>
    <div className="people-list">{members.map((member) => <div key={member.id}><Avatar member={member} /><span><strong>{member.name}</strong><small>Team member</small></span></div>)}</div>
    <form onSubmit={submit}><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Add a teammate" aria-label="Teammate name" /><button disabled={!name.trim()}><Plus size={16} /> Add</button></form>
  </div>
}
