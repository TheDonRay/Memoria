// HELPERS: turn raw memory data into the text shown on screen
// Used by: Polaroid, Home, MemoryDetail

import { format, parseISO } from 'date-fns'

// '2026-09-21' -> '21 SEP 2026' (empty string if there is no date)
export function formatDate(date) {
  if (!date) return ''
  return format(parseISO(date), 'dd MMM yyyy').toUpperCase()
}

// 38.7223, -9.1393 -> '38.7223° N / 9.1393° W' (empty string if there are no coordinates)
export function formatCoords(lat, lng) {
  if (lat == null || lng == null) return ''
  const ns = lat >= 0 ? 'N' : 'S'
  const ew = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}° ${ns} / ${Math.abs(lng).toFixed(4)}° ${ew}`
}

// A small tilt between -3 and 3 degrees that is always the same for the same id,
// so a polaroid doesn't jump around every time the page re-renders
export function rotationFor(id = '') {
  let hash = 0
  for (const char of String(id)) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0
  }
  return (Math.abs(hash) % 7) - 3
}
