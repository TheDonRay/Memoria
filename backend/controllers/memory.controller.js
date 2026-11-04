import { getAuth } from "@clerk/express";
// import the service file here
import { createMemoryService } from "../services/memory.service.js";
import { retrieveUsrMemoryService } from "../services/memory.service.js";
import { retrieveSpecificMemoryService } from "../services/memory.service.js";
import { deleteMemoryService } from "../services/memory.service.js";
import { updateMemoryService } from "../services/memory.service.js";
import { deleteImageService } from "../services/storage.service.js";

// fields a user is allowed to edit after creating a memory
// imageURL and imageKey are left out (a new photo should be a new memory), userId and captionStatus are controlled by the server
const EDITABLE_FIELDS = ["note", "caption", "takenAt", "location", "placeName"];

export const createMemoryController = async (req, res) => {
  //set up try and catch case and call service file with the userId
  try {
    // userId comes from the verified token (requireUserAuth already blocked unsigned users)
    const { userId } = getAuth(req);
    // captionStatus is left out on purpose, the server controls it (defaults to "pending")
    const { imageURL, imageKey, note, caption, takenAt, location, placeName } = req.body;

    // typeof also catches missing values, and stops objects from crashing .startsWith() below
    if (typeof imageURL !== "string" || typeof imageKey !== "string") {
      return res.status(400).json({
        error: "imageURL and imageKey are required",
      });
    }

    // the upload signature locks uploads to memoria/<userId>, so a key outside that folder isn't this user's image
    // the name part after the folder can only be letters, numbers, _ or -, so tricks like "memoria/<userId>/../<otherUser>/x" are rejected
    const isOwnKey = new RegExp(`^memoria/${userId}/[A-Za-z0-9_-]+$`).test(imageKey);
    if (!isOwnKey) {
      return res.status(403).json({
        error: "Image does not belong to this user",
      });
    }

    // the url has to point at our cloudinary account and be the same image as the key
    const cloudinaryPrefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`;
    if (!imageURL.startsWith(cloudinaryPrefix) || !imageURL.includes(`/${imageKey}.`)) {
      return res.status(400).json({
        error: "imageURL does not match imageKey",
      });
    }

    // call our service function with this data
    const newMemory = await createMemoryService(userId, {
      imageURL,
      imageKey,
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

// timeline page sizes: default when the client doesn't ask, and the most one request can get
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

// the cursor is "takenAt|_id" of the last memory on a page, base64url encoded so it's one url-safe string
// the frontend never reads it, it just sends back whatever nextCursor it got
const encodeCursor = (memory) =>
  Buffer.from(`${memory.takenAt.toISOString()}|${memory._id}`).toString("base64url");

// returns { takenAt, id } or null if the cursor was tampered with / malformed
const decodeCursor = (cursor) => {
  const [takenAtText, id] = Buffer.from(cursor, "base64url").toString("utf8").split("|");
  const takenAt = new Date(takenAtText);
  if (Number.isNaN(takenAt.getTime()) || !/^[a-f0-9]{24}$/.test(id ?? "")) return null;
  return { takenAt, id };
};

// retrieve one page of the user's timeline: GET /yourmemories?limit=20&cursor=<nextCursor from the last page>
export const retrieveUsrMemoryController = async (req, res) => {
  try {
    // start of with req userId and go into retrieving a user's specific data using their userId
    const { userId } = getAuth(req);

    // limit: optional, has to be a whole number 1 or more, capped so nobody can ask for everything at once
    let limit = DEFAULT_PAGE_SIZE;
    if (req.query.limit !== undefined) { 
      // remeber query reads in a string so we convert it into a number. 
      limit = Number(req.query.limit);
      if (!Number.isInteger(limit) || limit < 1) {
        return res.status(400).json({
          error: "limit must be a whole number of 1 or more",
        });
      }
      limit = Math.min(limit, MAX_PAGE_SIZE);
    }

    // cursor: optional, no cursor means the first page
    let cursor;
    if (req.query.cursor !== undefined) {
      cursor = typeof req.query.cursor === "string" ? decodeCursor(req.query.cursor) : null;
      if (!cursor) {
        return res.status(400).json({
          error: "Invalid cursor",
        });
      }
    }

    // the service fetches limit + 1, an extra one coming back means there's another page
    const results = await retrieveUsrMemoryService(userId, { limit, cursor });
    const hasMore = results.length > limit;
    const memories = hasMore ? results.slice(0, limit) : results;

    // next page continues after the last memory we're sending, null means the user reached the end
    const nextCursor = hasMore ? encodeCursor(memories[memories.length - 1]) : null;

    return res.status(200).json({ memories, nextCursor });
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

    // also delete the photo from cloudinary (older memories made before uploads have no imageKey, so skip those)
    // database first, cloudinary second: if this cleanup fails the memory is still gone, so just log it and still respond 200
    if (deletedMemory.imageKey) {
      try {
        const result = await deleteImageService(deletedMemory.imageKey);
        // destroy doesn't throw for a missing image, it returns { result: "not found" }
        if (result.result !== "ok") {
          console.warn("Cloudinary image not deleted", deletedMemory.imageKey, result.result);
        } 
      } catch (error) {
        console.error("Error deleting image from Cloudinary", deletedMemory.imageKey, error.message);
      }
    }

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
