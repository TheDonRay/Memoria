// storage service here: talks to cloudinary (not mongodb), no req/res
// the config file already set up cloudinary with our keys, so import that (default export, no curly braces)
import cloudinary from "../config/cloudinary.config.js";

// deletes one image from cloudinary using its public_id (the memory's imageKey)
// errors bubble up to the controller like the other services
export const deleteImageService = async (imageKey) => {
  // invalidate: true clears the CDN cache so the old URL stops working sooner
  // note: destroy doesn't throw when the image doesn't exist, it returns { result: "not found" } instead of { result: "ok" }
  return cloudinary.uploader.destroy(imageKey, { invalidate: true });
};
