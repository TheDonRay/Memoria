// user info controller here
import { getAuth } from "@clerk/express";
import userInfoService from "../services/userinfo.services.js";

const userInfoController = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    res.json(await userInfoService(userId));
  } catch (error) {
    console.error("Error fetching user info", error.message);
    res.status(500).json({ error: "Failed to fetch user info" });
  }
};

export default userInfoController;
