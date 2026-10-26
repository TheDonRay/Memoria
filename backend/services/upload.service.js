// upload service here: builds a signed set of upload params, no req/res
import cloudinary from "../config/cloudinary.config.js";

// only these image types can be uploaded with the signature
const ALLOWED_FORMATS = "jpg,jpeg,png,webp,heic";

const uploadSignatureService = (userId) => {
  // cloudinary wants the timestamp in seconds, the signature expires 1 hour after it
  const timestamp = Math.round(Date.now() / 1000);

  // lock the upload to this user's own folder 
  // these folders are actually in the cloudinary Library 
  const folder = `memoria/${userId}`;

  // every param the frontend sends to cloudinary (except file, api_key, cloud_name, resource_type) has to be signed here
  const paramsToSign = {
    timestamp,
    folder,
    allowed_formats: ALLOWED_FORMATS,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET,
  );

  // api key and cloud name are safe for the browser, the api secret is never sent
  return {
    signature,
    timestamp,
    folder,
    allowedFormats: ALLOWED_FORMATS,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
};

export default uploadSignatureService;
