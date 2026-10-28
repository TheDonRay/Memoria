// HELPER: turns the raw data into text that is easy to read
// Used by Polaroid, MemoryDetail, Home

import { format, parseISO } from 'date-fns'

// DATE: example, "2026-09-21" becomes "21 SEP 2026"
export function formatDate(iso) {
    if (!iso) return '' // no date so it shows nothing
    return format(parseISO(iso), 'dd MMM yyyy').toUpperCase()
}

// COORDINATES: example, (38.7223, -9.1393) becomes "38.7223° N / 9.1393° W"
export function formatCoords(lat, lng) {
    if (lat == null || lng == null) return '' // no coordinates so show nothing
    const northSouth = lat >= 0 ? 'N' : 'S' // positive latitude is North and negative is south
    const eastWest = lng >= 0 ? 'E' : 'W' // postive longitude is east and negative is west
    return `${Math.abs(lat).toFixed(4)}° ${northSouth} / ${Math.abs(lng).toFixed(4)}° ${eastWest}`
}

// TILT: this gives each polaroid its own small tilt from -3 to 3 degrees
// It is based on the memory ID, so a photo keeps the same tilt every time.
export function rotationFor(id) {
    let sum = 0
    for (const character of String(id)) sum += character.charCodeAt(0)
    return (sum % 7) - 3
}