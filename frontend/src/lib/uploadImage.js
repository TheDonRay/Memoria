// HELPER: sends one photo straight from the browser to Cloudinary (a "signed upload")
// The photo never passes through our own backend, the backend only signs the request:
//    1. POST /upload-signature  -> our backend gives a signature that is locked to this user's folder
//    2. POST to Cloudinary      -> Cloudinary checks the signature and stores the photo
// Returns { imageUrl, imageKey }, which is what POST /memories needs.
// Used by: MemoriesContext (addMemory)

export async function uploadImage(api, file) {
  // step 1: ask our backend for the signature
  const { signature, timestamp, folder, allowedFormats, apiKey, cloudName } =
    await api('/upload-signature', { method: 'POST' })

  // step 2: send the photo to Cloudinary.
  // Every field here (except file and api_key) was signed by the backend,
  // so the names and values have to match exactly or Cloudinary says no.
  const form = new FormData()
  form.append('file', file)
  form.append('api_key', apiKey)
  form.append('timestamp', timestamp)
  form.append('signature', signature)
  form.append('folder', folder)
  form.append('allowed_formats', allowedFormats)

  let res
  try {
    res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: form },
    )
  } catch {
    // fetch only throws when the request never arrived (offline, blocked...)
    throw new Error('Could not reach the photo storage. Check your connection.')
  }

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error?.message || `Photo upload failed (${res.status})`)
  }

  // secure_url is the https link to the photo, public_id is its name inside Cloudinary
  return { imageUrl: data.secure_url, imageKey: data.public_id }
}
