// COMPONENT: This is a friendly error box that says "try again"
// Used By: Home, Album, Search, MemoryDetail
/* 
Props:
    title - short heading (default)
    message - optional detail, very small message
    onRetry - optional function only if the try again button shows
*/

import { primaryButton } from '../lib/styles'

export default function ErrorMessag({
    title = 'something went wrong.',
    message,
    onRetry,
}) {
    return (
        <div role="alert" className="border-2 border-ink/20 bg-print p-6">
            <p className="font-medium">{title}</p>
            {message && (
                <p className="mt-1 font-mono text-xs text-ink/60">{message}</p>
            )}
              {onRetry && (
                <button onClick={onRetry} className={`mt-4 px-4 py-2 ${primaryButton}`}>
                Try Again
                </button>
              )}
        </div>
    )
}