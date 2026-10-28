// HELPER: shrinks a photo and returns it as a data URL (text we can show and save)
// Big phone photos are several MB, so we scale the longest side down and save as JPEG.
// TEMPORARY: once the Cloudinary upload is connected, the original file goes there instead.
// Used by: Upload

export function fileToDataUrl(file, maxSize = 800, quality = 0.7) {
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
      resolve(canvas.toDataURL('image/jpeg', quality))
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that image'))
    }

    img.src = url
  })
}
