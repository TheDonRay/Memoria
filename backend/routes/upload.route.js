import express from "express";
const uploadRoute = express.Router();

import requireUserAuth from "../middleware/auth.middleware.js";
import uploadSignatureController from "../controllers/upload.controller.js";

// post route: gives a logged in user a signature to upload an image straight to cloudinary
// post not get, since every call creates a new credential and get responses can be cached
uploadRoute.post("/upload-signature", requireUserAuth, uploadSignatureController);

export default uploadRoute;
