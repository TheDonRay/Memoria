// DEMO for the Memories: Sample memories so every page has photos while we build the frontend.
// This file is deleted once real uploads work.
// To add more we can just drop a photo in the src/assets/examples/ and then import it here and add an entry.
// DEMO MODE: put VITE_DEMO = true in .env.local to see Album/Search/Detail with this data without logging in.
// Delete this file once real uploads are made

import lisbon from '../assets/examples/lisbon-alley.jpg'
import paris from '../assets/examples/paris-cafe.jpg'
import kyoto from '../assets/examples/kyoto-alley.jpg'

export const DEMO_MODE = import.meta.env.VITE_DEMO === 'true'

// demo ids all start with demo, so it is easy to tell them apart from real memories
export const isDemoId = (id) => String(id).startsWith('demo-')

export const demoMemories = [
    { id: 'demo-1', imageUrl: lisbon, place: 'Lisbon', date: '2026-09-21',
    caption: 'Took the long way back to the apartment.',
    notes: 'Stopped for coffee and forgot about the time. I want more afternoons like this.',
    lat: 38.7223, lng: -9.1393 },
    { id: 'demo-2', imageUrl: paris, place: 'Paris', date: '2026-08-11',
    caption: 'We stayed for a second coffee.',
    notes: 'A table by the window, a croissant, and nowhere to be.',
    lat: 48.8566, lng: 2.3522 },
    { id: 'demo-3', imageUrl: kyoto, place: 'Kyoto', date: '2026-07-27',
    caption: 'Up early. The whole street was still quiet.',
    notes: 'Rain overnight, wet stones, a bicycle leaning on the wall.',
    lat: 35.0116, lng: 135.7681 },
]