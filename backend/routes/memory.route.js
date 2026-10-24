import express from "express";
const userMemories = express.Router();

//import middleware here
import requireUserAuth from "../middleware/auth.middleware.js";

//import controller service here
import { createMemoryController } from "../controllers/memory.controller.js";
import { retrieveUsrMemoryController } from "../controllers/memory.controller.js";
import { retrieveSpecificMemoryController } from "../controllers/memory.controller.js";
import { deleteMemoryController } from "../controllers/memory.controller.js";
import { updateMemoryController } from "../controllers/memory.controller.js";

// going to be a post request that uploads the memories for us here
userMemories.post("/memories", requireUserAuth, createMemoryController);

// implementing the get route of retrieving users memory pictures.
userMemories.get("/yourmemories", requireUserAuth, retrieveUsrMemoryController);

// this route is to get a specific user's memories here as such
userMemories.get("/memories/:id", requireUserAuth, retrieveSpecificMemoryController);

// delete route: lets a user delete one of their own memories
// same path as the get-one route, the HTTP method (DELETE vs GET) tells them apart
userMemories.delete("/memories/:id", requireUserAuth, deleteMemoryController);

// update route: lets a user edit the details (note, caption, date, location, place) of one of their own memories
userMemories.patch("/memories/:id", requireUserAuth, updateMemoryController);

export default userMemories;
