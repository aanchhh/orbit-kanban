# Orbit product notes

## Opportunity

Most small-team Kanban tools either feel like enterprise software or collapse into decorated todo lists. Orbit aims for the middle: enough context for real work, but with a strong visual rhythm that rewards daily use.

## Primary user story

As a guest user, I can arrive without registration, understand the project state at a glance, capture a task, enrich it with ownership and context, and move it through delivery while my workspace remains private to my anonymous session.

## Experience map

1. **Arrive:** see a populated example in demo mode or a private empty cloud workspace.
2. **Orient:** summary metrics and four expressive columns clarify project health.
3. **Capture:** the global and per-column actions preserve the intended starting status.
4. **Organize:** labels, assignees, priority, and dates add just enough structure.
5. **Move:** cards update status on drop; keyboard movement is supported by dnd-kit.
6. **Discuss:** the task drawer keeps comments and activity close to the work.
7. **Focus:** search and filters narrow the board without changing the underlying data.

## Deliberate design choices

- Warm neutrals reduce dashboard fatigue; chartreuse marks action without flooding the UI.
- Column language pairs operational states with human verbs: Queue, Making, Polishing, Shipped.
- Task-card metadata is progressive: title first, then tags, then time/ownership.
- The local demo is explicitly labeled so reviewers never confuse browser storage with Supabase persistence.
- Mobile keeps the mental model intact with horizontal snap rather than stacking four very long sections.

