// Shared Tailwind class strings, so the same element looks the same on every page

// small uppercase label above a form field (also the small line above a page title)
export const labelClass =
  'block font-mono text-[11px] uppercase tracking-wider text-ink/60'

// the big heading at the top of Upload, Album and Search (a size smaller on phones)
export const pageTitle = 'font-display text-4xl font-bold md:text-5xl'

// text box / date picker / textarea
// text-base on phones: iOS Safari zooms the whole page in when a field's text is under 16px
export const inputClass =
  'mt-2 w-full min-w-0 border border-ink/20 bg-print px-4 py-3 text-base outline-none focus:border-ink md:text-sm'

// smaller field for the filter rows (Album dropdowns, Search sidebar)
export const filterClass =
  'min-w-0 border border-ink/20 bg-print px-3 py-2 text-base outline-none focus:border-ink md:text-sm'

// the yellow button with the hard shadow (add padding/layout classes where it's used)
export const primaryButton =
  'border-2 border-ink bg-flash text-sm font-semibold shadow-button'

// small underlined text action (Cancel, Delete, Reset filters), padded so it is easy to tap
export const textButton = 'py-2 text-sm underline'
