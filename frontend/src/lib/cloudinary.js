// HELPER: sends one photo straight to Cloudinary using a signature from our backend.
// Used by: Upload
//
// HOW IT WORKS
//   1. The backend (POST /api/v1/upload-signature) hands us a signature plus the fields it signed
//   2. We add the photo and send everything to Cloudinary
//   3. Cloudinary answers with the photo's address (secure_url) and its id (public_id)
//
// It uses XMLHttpRequest instead of fetch because fetch can't tell us the upload progress.

// these come back from the backend but must NOT be sent to Cloudinary as form fields
const NOT_FORM_FIELDS = ['cloudName', 'cloud_name', 'uploadUrl', 'upload_url', 'apiKey', 'api_key']

// Our backend answers in camelCase (allowedFormats), but Cloudinary wants snake_case
// (allowed_formats). The name must match exactly or Cloudinary says "Invalid Signature".
const toSnakeCase = (name) => name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)

export function uploadToCloudinary(file, signature, onProgress) {
  return new Promise((resolve, reject) => {
    // the backend may use camelCase or snake_case names, so accept both
    const cloudName =
      signature.cloudName ||
      signature.cloud_name ||
      import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const apiKey =
      signature.apiKey ||
      signature.api_key ||
      import.meta.env.VITE_CLOUDINARY_API_KEY

    // fail early with a clear message instead of a confusing Cloudinary error
    if (!signature.signature || !signature.timestamp) {
      return reject(new Error('The upload signature is missing its signature or timestamp.'))
    }
    if (!cloudName) {
      return reject(new Error('No Cloudinary cloud name. Ask the backend to send cloudName.'))
    }
    if (!apiKey) {
      return reject(new Error('No Cloudinary API key. Ask the backend to send apiKey.'))
    }

    // build the form: every signed field (signature, timestamp, folder, ...) + key + photo
    const form = new FormData()
    for (const [name, value] of Object.entries(signature)) {
      if (!NOT_FORM_FIELDS.includes(name)) form.append(toSnakeCase(name), value)
    }
    form.append('api_key', apiKey)
    form.append('file', file)

    const request = new XMLHttpRequest()
    request.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`)

    // tells the page how far along we are, 0 to 100
    request.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    request.onload = () => {
      let data = null
      try {
        data = JSON.parse(request.responseText)
      } catch {
        // not JSON, handled below
      }
      if (request.status >= 200 && request.status < 300 && data?.secure_url) {
        // names match what POST /memories expects: imageURL and imageKey
        resolve({ imageURL: data.secure_url, imageKey: data.public_id })
      } else {
        reject(new Error(data?.error?.message || `Cloudinary upload failed (${request.status})`))
      }
    }

    request.onerror = () => reject(new Error('Network error while uploading the photo.'))
    request.send(form)
  })
}