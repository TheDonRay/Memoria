// PAGE: /upload
// This is where the memories get created
/* 
STEPS:
    1. User drops a photo
    2. We read GPS and date from the photo (if available)
    3. User fills in or fixes the fields of data
    4. Save -> goes to the memory page
*/

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { gps, parse } from 'exifr'
import { format } from 'date-fns'
import { ImagePlus } from 'lucide-react'
import { useMemories } from '../context/MemoriesContext'
import { fileToDataUrl } from '../lib/resizeImage'
import Polaroid from '../components/Polaroid'

// This shares the same style for the form fields so they all match
const labelClass = 'block font-mono text-[11px] uppercase tracking-wider text-ink/60'
const inputClass = 'mt-2 w-full border border-ink/20 bg-print px-4 py-3 text-sm outline-none focus:border-ink'

export default function Upload() {
    const navigate = useNavigate()
    const { addMemory } = useMemories()

    // FORM STATE (everything starts empty obviously)
    const [photo, setPhoto] = useState('') // the resized photo, as text we can store
    const [place, setPlace] = useState('')
    const [lat, setLat] = useState('')
    const [lng, setLng] = useState('')
    const [date, setDate] = useState('')
    const [caption, setCaption] = useState('')
    const [notes, setNotes] = useState('')
    const [detected, setDetected] = useState(false) // true if GPS was found in the photo
    const [error, setError] = useState('')


// THIS RUNS WHEN THE USER DROPS OR PICKS A PHOTO
async function onDrop(files) {
    const file = files[0]
    if (!file) return
    setError('')

// Step 1: shrink the photo so it is small enough to save it
try {
    setPhoto(await fileToDataUrl(file))
} catch {
    setError('Could not read that image. Try to JPG or PNG')
    return
}

// Step 2: read the GPS from the OG file (shrinking removes it)
try {
    const found = await gps(file)
    if (found && found.latitude != null) {
        setLat(found.latitude.toFixed(4))
        setLng(found.longitude.toFixed(4))
        setDetected(true)
    } else {
        setDetected(false) 
        }
    } catch {
        setDetected (false) // no GPS is fine, the user can just type it
    }

// Step 3: read the date the photo was taken
try {
    const info = await parse(file, ['DateTimeOriginal'])
    if (info && info.DateTimeOriginal) {
        setDate(format(info.DateTimeOriginal, 'yyyy-MM-dd'))
    }
} catch {
    // no date in the photo, so the user can just pick one
    }
}

// drag and drop box settings, images only and its one at a time
const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {'image/*': [] },
    multiple: false,
})

// THIS RUNS WHEN THE USER CLICKS SAVE
function handleSubmit(event) {
    event.preventDefault()

    // all three of these are required
    if (!photo) return setError ('Add a photo first.')
    if (!place.trim()) return setError ('Add a place name.')
    if (!date) return setError('Pick the date of this memory.')

    // coordinates are optional, but without it, there is no pin on the globe
    const latNumber = parseFloat(lat)
    const lngNumber = parseFloat(lng)
    const hasCoords = !Number.isNaN(latNumber) && !Number.isNaN(lngNumber)

    // save it and then jump to the new memory's page
    const id = addMemory({
        imageUrl: photo,
        place: place.trim(),
        lat: hasCoords ? latNumber : null,
        lng: hasCoords ? lngNumber : null,
        date,
        caption: caption.trim(),
        notes: notes.trim(),
    })
    navigate(`/memory/${id}`)
}

return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink/60">
        A little moment, kept.
      </p>
      <h1 className="mt-2 font-display text-5xl font-bold">Upload a memory</h1>
      <p className="mt-2 text-ink/60">
        One photo, a few words. Something to come back to.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 grid grid-cols-2 gap-16">
        {/* LEFT COLUMN: photo */}
        <div>
          <span className={labelClass}>Photo</span>

          {/* the drag-and-drop box */}
          <div
            {...getRootProps()}
            className={`mt-2 flex h-64 cursor-pointer flex-col items-center justify-center border-2 border-dashed ${
              isDragActive ? 'border-ink bg-flash/20' : 'border-ink/30 bg-print/60'
            }`}
          >
            <input {...getInputProps()} />
            <ImagePlus size={28} className="text-ink/50" />
            <p className="mt-3 text-sm">
              Drop a photo here or <span className="underline">browse</span>
            </p>
            <p className="mt-1 font-mono text-[11px] text-ink/40">JPG or PNG</p>
          </div>

          {/* live polaroid preview, updates as the user types */}
          {photo && (
            <div className="mt-8 w-64">
              <Polaroid
                memory={{ id: 'preview', imageUrl: photo, place: place || 'Place', date, caption }}
              />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: details */}
        <div className="space-y-6">
          <label className="block">
            <span className={labelClass}>Place</span>
            <input
              className={inputClass}
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="e.g. a city or neighborhood"
            />
          </label>

          {/* coordinates: auto-filled from the photo, or typed by hand */}
          <div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className={labelClass}>Latitude</span>
                <input className={inputClass} value={lat} onChange={(e) => setLat(e.target.value)} placeholder="optional" />
              </label>
              <label className="block">
                <span className={labelClass}>Longitude</span>
                <input className={inputClass} value={lng} onChange={(e) => setLng(e.target.value)} placeholder="optional" />
              </label>
            </div>
            <p className="mt-2 font-mono text-[11px] text-ink/50">
              {detected
                ? `detected from photo: ${lat} N, ${lng} E`
                : 'No GPS found in the photo. Add coordinates to get a pin on the globe.'}
            </p>
          </div>

          <label className="block">
            <span className={labelClass}>Date</span>
            <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
          </label>

          <label className="block">
            <span className={labelClass}>Caption</span>
            <input
              className={inputClass}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="A line about this moment"
            />
            {/* later, Rayat's AI caption will fill this field */}
          </label>

          <label className="block">
            <span className={labelClass}>Notes (optional)</span>
            <textarea
              rows={4}
              className={inputClass}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>

          {error && <p className="text-sm font-medium text-red-700">{error}</p>}

          {/* the one yellow button on this page */}
          <button
            type="submit"
            className="border-2 border-ink bg-flash px-6 py-3 text-sm font-semibold shadow-button"
          >
            Save memory
          </button>
        </div>
      </form>
    </div>
  )
}