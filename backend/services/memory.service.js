// call database since we are inserting data into the actual database
import Memory from '../model/schema.model.js';

export const createMemoryService = async (userId, data) => {
    // insert the memory linked to the signed in user, errors bubble up to the controller
    return Memory.create({ ...data, userId });
}

export const retrieveUsrMemoryService = async (userId) => { 
    // call database and use .find method on userId to get data 
}; 