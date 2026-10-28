// COMPONENT: This will show the text with the searched word highlighted in yellow.
// Used in Search page

export default function Highlight({ text = '', query = '' }) {
  const word = query.trim()

  // If nothing is typed, show the text as it is
  if (!word) return <>{text}</>

  // Escape the special characters. Ex: ")" won't break the search
  const safe = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // Splitting with a capture group keeps the matched piece within the array still
  const parts = text.split(new RegExp(`(${safe})`, 'gi'))

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === word.toLowerCase() ? (
          // The match gets highlighted yellow
          <mark key={i} className="bg-flash px-0.5 text-ink">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}
