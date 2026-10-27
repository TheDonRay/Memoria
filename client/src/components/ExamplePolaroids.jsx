//COMPONENT: these are the example polarods that are only shown when the user has no memories
// They will just be examples so they never look like real data
// Used by: Home

import Polaroid from './Polaroid'
import { exampleImages } from '../lib/exampleImages'

// Gives a small til so the stack looks DIY
const tilts = [-4, 2, -1]

export default function ExamplePolaroids() {
    // no example files yet so it shows nothing
    if (exampleImages.length === 0) return null

    return (
        <div className="mb-8">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-wider text-ink/40">
                Example: Looks like this
            </p>
            <div className="flex gap-4">
        {exampleImages.slice(0, 3).map((src, i) => (
          // every photo is still a Polaroid, like everywhere else on the site
          <Polaroid
            key={src}
            memory={{ id: `example-${i}`, imageUrl: src, place: 'Example', date: '' }}
            rotate={tilts[i]}
            className="w-32"
          />
        ))}
      </div>
    </div>
  )
}