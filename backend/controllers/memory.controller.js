import { getAuth } from "@clerk/express";
// import the service file here
import { createMemoryService } from "../services/memory.service.js";
import { retrieveUsrMemoryService } from "../services/memory.service.js";
import { retrieveSpecificMemoryService } from "../services/memory.service.js";
import { deleteMemoryService } from "../services/memory.service.js";
import { updateMemoryService } from "../services/memory.service.js";

// fields a user is allowed to edit after creating a memory
// imageURL is left out (a new photo should be a new memory), userId and captionStatus are controlled by the server
const EDITABLE_FIELDS = ["note", "caption", "takenAt", "location", "placeName"];

export const createMemoryController = async (req, res) => {
  //set up try and catch case and call service file with the userId
  try {
    // userId comes from the verified token (requireUserAuth already blocked unsigned users)
    const { userId } = getAuth(req);
    // captionStatus is left out on purpose, the server controls it (defaults to "pending")
    const { imageURL, note, caption, takenAt, location, placeName } = req.body;

    if (!imageURL) {
      return res.status(400).json({
        error: "imageURL is required",
      });
    }

    // call our service function with this data
    const newMemory = await createMemoryService(userId, {
      imageURL,
      note,
      caption,
      takenAt,
      location,
      placeName,
    });
    return res.status(201).json(newMemory);
  } catch (error) {
    // schema validation errors are the client's fault, anything else is a server error
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: error.message,
      });
    }
    console.error("Error creating memory", error.message);
    // otherwise we get
    return res.status(500).json({
      error: "Failed to create memory",
    });
  }
};

// retrieve user memory information here as such
export const retrieveUsrMemoryController = async (req, res) => {
  try {
    // start of with req userId and go into retrieving a user's specific data using their userId
    const { userId } = getAuth(req);
    // call the service function.
    const memories = await retrieveUsrMemoryService(userId);
    return res.status(200).json(memories);
  } catch (error) {
    // a GET has no body to validate, so any error here is a server error
    console.error("Error retrieving memories", error.message);
    return res.status(500).json({
      error: "Failed to retrieve memories",
    });
  }
};

export const retrieveSpecificMemoryController = async (req, res) => {
  // get the id and req send it off to the service route to search by that specific Id that the user finds.
  try {
    const { userId } = getAuth(req);
    // get the specific memory id from the parameter (/memories/:id), this is the memory's _id not the user's id
    const memoryId = req.params.id;

    const memory = await retrieveSpecificMemoryService(userId, memoryId);

    // null means it doesn't exist or belongs to another user, both get a 404 so we don't reveal other users' memories
    if (!memory) {
      return res.status(404).json({
        error: "Memory not found",
      });
    }
    return res.status(200).json(memory);
  } catch (error) {
    // CastError means the id isn't a valid MongoDB ObjectId (e.g. /memories/abc)
    if (error.name === "CastError") {
      return res.status(400).json({
        error: "Invalid memory id",
      });
    }
    console.error("Error retrieving memory", error.message);
    return res.status(500).json({
      error: "Failed to retrieve memory",
    });
  }
};

// delete one of the signed in user's memories: DELETE /memories/:id
export const deleteMemoryController = async (req, res) => {
  try {
    // WHO is deleting (from the token) and WHICH memory (from the url)
    const { userId } = getAuth(req);
    const memoryId = req.params.id;

    const deletedMemory = await deleteMemoryService(userId, memoryId);

    // null covers both "doesn't exist" and "belongs to someone else", same 404 so we don't leak other users' memories
    if (!deletedMemory) {
      return res.status(404).json({
        error: "Memory not found",
      });
    }

    // LATER (once image uploads exist): also delete the image from Cloudinary/S3 using deletedMemory.imageURL,
    // if that cleanup fails just log it, the memory is already gone so still respond 200
    return res.status(200).json({
      message: "Memory deleted",
      id: memoryId,
    });
  } catch (error) {
    // CastError means the id isn't a valid MongoDB ObjectId (e.g. /memories/abc)
    if (error.name === "CastError") {
      return res.status(400).json({
        error: "Invalid memory id",
      });
    }
    console.error("Error deleting memory", error.message);
    return res.status(500).json({
      error: "Failed to delete memory",
    });
  }
};

// edit one of the signed in user's memories: PATCH /memories/:id
// PATCH = the client only sends the fields that changed, not the whole memory
export const updateMemoryController = async (req, res) => {
  try {
    // WHO is editing (from the token) and WHICH memory (from the url)
    const { userId } = getAuth(req);
    const memoryId = req.params.id;

    // copy over only the allowed fields that were actually sent
    // (a field the client didn't send stays undefined and must not overwrite the saved value)
    const updates = {};
    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: "No valid fields to update",
      });
    }

    const updatedMemory = await updateMemoryService(userId, memoryId, updates);

    // null covers both "doesn't exist" and "belongs to someone else"
    if (!updatedMemory) {
      return res.status(404).json({
        error: "Memory not found",
      });
    }
    return res.status(200).json(updatedMemory);
  } catch (error) {
    // CastError: invalid memory id or a field with the wrong type (e.g. takenAt: "not a date")
    // ValidationError: the update breaks a schema rule (e.g. a bad location)
    if (error.name === "CastError" || error.name === "ValidationError") {
      return res.status(400).json({
        error: error.message,
      });
    }
    console.error("Error updating memory", error.message);
    return res.status(500).json({
      error: "Failed to update memory",
    });
  }
};
