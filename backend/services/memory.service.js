// call database since we are inserting data into the actual database
import Memory from "../model/schema.model.js";

export const createMemoryService = async (userId, data) => {
  // insert the memory linked to the signed in user, errors bubble up to the controller
  return Memory.create({ ...data, userId });
};

// one page of a user's timeline, newest first
// cursor = { takenAt, id } of the last memory on the previous page (the controller decodes it), none for the first page
export const retrieveUsrMemoryService = async (userId, { limit = 20, cursor } = {}) => {
  const filter = { userId };

  if (cursor) {
    // only memories that come AFTER the cursor in the sort order:
    // taken earlier, or taken at the exact same time with a smaller _id (the tie-breaker)
    filter.$or = [
      { takenAt: { $lt: cursor.takenAt } },
      { takenAt: cursor.takenAt, _id: { $lt: cursor.id } },
    ];
  }

  // sort matches the { userId, takenAt, _id } index exactly, so mongodb reads the page straight from the index
  // fetch one extra: if it comes back there's another page (the controller drops it before responding)
  return Memory.find(filter)
    .sort({ takenAt: -1, _id: -1 })
    .limit(limit + 1);
};

export const retrieveSpecificMemoryService = async (userId, memoryId) => {
  // mongodb call to search for that specific id for a user and return the memory etc
  // matching on both _id and userId means users can only get their own memories (returns null otherwise)
  return Memory.findOne({ _id: memoryId, userId });
};

export const deleteMemoryService = async (userId, memoryId) => {
  // matching on BOTH _id and userId means a user can only delete their own memories
  // one atomic database call: finds and deletes in the same step, no separate "find then delete"
  // returns the deleted document (useful later to get its imageURL for storage cleanup), or null if nothing matched
  // no try/catch here, errors bubble up to the controller like the other services
  return Memory.findOneAndDelete({ _id: memoryId, userId });
};

export const updateMemoryService = async (userId, memoryId, updates) => {
  // same ownership check as get-one and delete: only matches the user's own memory, returns null otherwise
  // returnDocument 'after' gives back the updated document instead of the old one
  // runValidators makes mongoose check the schema on updates too (it only does it on create by default)
  return Memory.findOneAndUpdate({ _id: memoryId, userId }, updates, {
    returnDocument: "after",
    runValidators: true,
  });
};
