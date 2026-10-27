// HELPER: This shrinks the photo the user picked so it is small enough to save.
// Phone photos are several MB and browser storage fills up fast without this.
// Used by Upload page
// NOTE: shrinking removes the photo's hidden GPS info, so Upload reads GPS from the OG file before using this helper

export function fileToDataUrl(file, maxSize = 900) {
    return new Promise((resolve, reject) => {
        // Step 1: read the file into the memory
        const reader = new FileReader()
        reader.onerror = reject
        reader.onload = () => {
            // Step 2: load it as an image so we can measure it
            const img = new Image()
            img.onerror = reject
            img.onload = () => {
                // Step 3: work out how much to shrink
                const scale = Math.min(1, maxSize / Math.max(img.width, img.height))

                // Step 4: draw the smaller version onto hidden canvas
                const canvas = document.createElement('canvas')
                canvas.width = Math.round(img.width * scale)
                canvas.height = Math.round(img.height * scale)
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)

                // Step 5: turn the canvas into a compressed JPEG that we can store as a text
                resolve(canvas.toDataURL('image/jpeg', 0.8))
            }
            img.src = reader.result
        }
        reader.readAsDataURL(file)
    })
}