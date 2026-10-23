// call database since we are inserting data into the actual database
import Memory from '../model/schema.model.js';

export const createMemoryService = async (userId, data) => {
    // insert the memory linked to the signed in user, errors bubble up to the controller
    return Memory.create({ ...data, userId });
}

export const retrieveUsrMemoryService = async (userId) => { 
    // call database and use .find method on userId to get data, newest first (createdAt breaks ties / covers missing takenAt)
    return Memory.find({ userId }).sort({ takenAt: -1, createdAt: -1 });
};  

export const retrieveSpecificMemoryService = async (userId, memoryId) => {
    // mongodb call to search for that specific id for a user and return the memory etc
    // matching on both _id and userId means users can only get their own memories (returns null otherwise)
    return Memory.findOne({ _id: memoryId, userId });
}

export const deleteMemoryService = async (userId, memoryId) => {
    // matching on BOTH _id and userId means a user can only delete their own memories
    // one atomic database call: finds and deletes in the same step, no separate "find then delete"
    // returns the deleted document (useful later to get its imageURL for storage cleanup), or null if nothing matched
    // no try/catch here, errors bubble up to the controller like the other services
    return Memory.findOneAndDelete({ _id: memoryId, userId });
};
