// HELPER: groups memories by the month they were taken, newest month first
// Returns: [{ key: '2026-09', label: 'September 2026', items: [...] }, ...]
// Used by: Home, Album

import { format, parseISO } from 'date-fns'

export function groupByMonth(memories) {
  // newest memory first, so every month's list is also newest first
  const sorted = [...memories].sort((a, b) => b.date.localeCompare(a.date))

  const groups = []
  for (const memory of sorted) {
    const key = memory.date.slice(0, 7) // '2026-09-21' -> '2026-09'
    let group = groups.find((g) => g.key === key)
    if (!group) {
      group = {
        key,
        label: format(parseISO(memory.date), 'MMMM yyyy'),
        items: [],
      }
      groups.push(group)
    }
    group.items.push(memory)
  }
  return groups
}
