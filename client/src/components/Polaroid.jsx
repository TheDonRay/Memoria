// COMPONENT: This shows the photo as a polaroid. EVERY photo on the site is shown as a polaroid.
// Props: 
//      Memory - the saved memory (imageURL, place, date, caption)
//      rotate - tilt in degress (defaults to a stable tilt based on the id)
//      compact - true which means small print with no text strips (used in list rows)

import { formatDate, rotationFor } from '../lib/format'

export default function Polaroid({
    memory,
    rotate = rotationFor(memory.id),
    compact = false,
    className = '',
}) {
    return (
        <figure
        style={{ transform: `rotate(${rotate}deg)`}}
        // thick off-white border + hard shadow with no blur (THIS IS FROM FIGMA)
        className={`bg-print ${
            compact
            ? 'p-1 shadow-[2px_2px_0_rgba(16,20,20,0.25)]'
            : 'p-3 pb-4 shadow-polaroid'
        } ${className}`}
        >
        {/* The user's photo, cropped into a square to fit the polaroid */}
        <img
            src={memory.imageUrl}
            alt={memory.caption || memory.place}
            className="aspect-square w-full object-cover"
        />
        {/* Taller bottom stirp with place + the date (hidden in compact mode) */}
        {!compact && (
            <figcaption className="mt-3">
            <p className="font-display text-lg font-bold leading-tight">
            {memory.place}
            </p>
            <p className = "mt-1 font-mono text-[10px] tracking-wider text-ink/60">
            {formatDate(memory.date)}
            </p>
           </figcaption>
        )}
        </figure>
    )
}