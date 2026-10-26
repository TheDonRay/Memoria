// upload controller here: hands the logged in user a signature to upload straight to cloudinary
import { getAuth } from "@clerk/express";
import uploadSignatureService from "../services/upload.service.js";

const uploadSignatureController = (req, res) => {
  try {
    // userId always comes from clerk, never the request body, so nobody can sign for another user's folder
    const { userId } = getAuth(req);
    res.json(uploadSignatureService(userId));
  } catch (error) {
    console.error("Error creating upload signature", error.message);
    res.status(500).json({ error: "Failed to create upload signature" });
  }
};

export default uploadSignatureController;
