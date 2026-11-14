// HELPERS for the custom login / sign up pages (Clerk hooks, our own UI)

// Turns a Clerk error into { message, field } so we can show it under the right input.
// Clerk errors look like: err.errors = [{ code, message, longMessage, meta: { paramName } }]
const FIELD_FOR_PARAM = {
  identifier: 'email',
  email_address: 'email',
  password: 'password',
  code: 'code',
}

export function readClerkError(err) {
  const first = err?.errors?.[0]
  if (!first) {
    return { message: 'Something went wrong. Please try again.', field: null }
  }
  return {
    message: first.longMessage || first.message,
    field: FIELD_FOR_PARAM[first.meta?.paramName] ?? null,
  }
}

// Where to go after logging in.
// ProtectedRoute sends people here with redirect_url=<full url>, either as
// ?redirect_url=... or (Clerk's default) in the hash: #/?redirect_url=...
// Only follow it if it points back at this site, otherwise anyone could bounce users elsewhere.
export function getRedirectTarget(search, hash = '') {
  const fromHash = hash.includes('?') ? hash.slice(hash.indexOf('?')) : ''
  const raw =
    new URLSearchParams(search).get('redirect_url') ||
    new URLSearchParams(fromHash).get('redirect_url')
  if (!raw) return '/'
  try {
    const url = new URL(raw, window.location.origin)
    if (url.origin !== window.location.origin) return '/'
    const path = url.pathname + url.search + url.hash
    // never send someone back to the login page after logging in
    return /^\/(login|signup)/i.test(url.pathname) ? '/' : path
  } catch {
    return '/'
  }
}

// "?redirect_url=/album" to carry the target between /login and /signup ("" for home)
export const redirectSearch = (target) =>
  target === '/' ? '' : `?redirect_url=${encodeURIComponent(target)}`

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

// REMEMBER ME
// Clerk keeps you signed in until you sign out. When "Remember me" is unticked we
// save that choice plus a browser-session cookie (no expiry, so the browser
// deletes it when it closes). Next time the app starts, if the choice was "don't
// remember" and the cookie is gone, the browser was closed, so we sign out.
const REMEMBER_KEY = 'memoria:remember'
const ALIVE_COOKIE = 'memoria_alive'

export function saveRememberChoice(remember) {
  try {
    localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0')
  } catch {
    // storage blocked (private mode etc.), just stay signed in like normal
  }
  document.cookie = `${ALIVE_COOKIE}=1; path=/; SameSite=Lax`
}

export function shouldForgetSession() {
  let choice = null
  try {
    choice = localStorage.getItem(REMEMBER_KEY)
  } catch {
    return false
  }
  const alive = document.cookie
    .split('; ')
    .some((c) => c.startsWith(`${ALIVE_COOKIE}=`))
  return choice === '0' && !alive
}
