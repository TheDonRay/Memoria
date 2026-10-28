// COMPONENT: the dashed box shown when a page has no data yet
/*
PROPS:
    title       - big text
    text        - one line explaining what to do
    example     - optional gray sample text
    children    - optional button or link shown at the bottom
*/

export default function EmptyState({ title, text, example, children }) {
  return (
    <div className="border-2 border-dashed border-ink/20 p-12">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <p className="mt-2 max-w-md text-ink/60">{text}</p>

      {/* only shows if an example is given */}
      {example && (
        <p className="mt-4 font-mono text-xs text-ink/40">
          EXAMPLE: <span className="italic">{example}</span>
        </p>
      )}

      {/* the button or link goes here */}
      <div className="mt-6">{children}</div>
    </div>
  )
}
