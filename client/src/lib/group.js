// This is a helper file. We will use this to group memories by month, starting from the newest first.
// This file will be used by the Album page and Home page

import { format, parseISO } from 'date-fns'

export function groupByMonth(memories) {
    // newest date comes first
    // memories with no date will sort to the end
    const sorted = [...memories].sort((a, b) =>
        (b.date || '').localeCompare(a.date || '')
    )

    const groups = []
    for (const memory of sorted) {
        // ex: "2026-09-21" turns to "2026-09"
        const key = memory.date ? memory.date.slice(0, 7) : 'undated'

        // This is the find the group for this month or make a new one
        let group = groups.find((g) => g.key ==key)
        if (!group) {
            group = {
                key,
                label: key === 'undated' ? 'No date' : format(parseISO(`${key}-01`), 'MMMM yyyy'),
                items: []
            }
            groups.push(group)
        }
        group.items.push(memory)
    }
    return groups
}