// HELPER: finds the image we dorp into src/assets/examples/
// These are the Designs only, not the images that the user puts in.
// TO add or remove, just add or delete a file in the folder
// If the folder is empty, it'll just be an empty list and nothing happens

const files = import.meta.glob('../assets/examples/*,{jpg,jpeg,png,webp}', {
    eager: true,
    import: 'default',
})

// This turns the file list into an array of image addresses
export const exampleImages = Object.values(files)
