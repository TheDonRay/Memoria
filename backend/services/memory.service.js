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