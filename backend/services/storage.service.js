// storage service here: talks to cloudinary (not mongodb), no req/res
// TODO 1: import cloudinary from the config file in ../config 


// deletes one image from cloudinary using its public_id (the memory's imageKey)
// errors bubble up to the controller like the other services
export const deleteImageService = async (imageKey) => {
  // TODO 2: return cloudinary.uploader.destroy(...) with the imageKey
  // TODO 3: pass the option { invalidate: true } so the CDN cache is cleared and the old URL stops working sooner
  // note: destroy doesn't throw when the image doesn't exist, it returns { result: "not found" } instead of { result: "ok" }
};
