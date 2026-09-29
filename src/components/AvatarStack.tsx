import type { Member } from '../types'

export function Avatar({ member, size = 'md' }: { member: Member; size?: 'sm' | 'md' }) {
  const initials = member.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()
  return <span className={`avatar avatar--${size}`} style={{ '--avatar-color': member.color } as React.CSSProperties} title={member.name}>{initials}</span>
}

export function AvatarStack({ ids, members }: { ids: string[]; members: Member[] }) {
  const assigned = ids.map((id) => members.find((member) => member.id === id)).filter(Boolean) as Member[]
  if (!assigned.length) return null
  return <div className="avatar-stack" aria-label={`Assigned to ${assigned.map((member) => member.name).join(', ')}`}>
    {assigned.slice(0, 3).map((member) => <Avatar key={member.id} member={member} size="sm" />)}
  </div>
}

