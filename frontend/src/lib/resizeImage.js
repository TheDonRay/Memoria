// HELPER: shrinks a photo before it is uploaded
// Big phone photos are several MB, so we scale the longest side down and save as JPEG.
// That makes the upload fast and keeps us well under Cloudinary's file size limit.
// NOTE: shrinking removes the GPS + date stored inside the photo, so Upload reads
// those from the original file first.
// Used by: Upload

export function resizeImage(file, maxSize = 1600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      // keep the shape, just make the longest side at most maxSize
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)

      // toBlob gives us a real file (binary), which is what Cloudinary wants
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error('Could not read that image')),
        'image/jpeg',
        quality,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that image'))
    }

    img.src = url
  })
}
