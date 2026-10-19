import express from 'express'; 
const userMemories = express.Router();  

//import middleware here 
import requireUserAuth from '../middleware/auth.middleware.js'; 

//import controller service here  
import { createMemoryController } from '../controllers/memory.controller.js'; 
import { retrieveUsrMemoryController } from '../controllers/memory.controller.js'; 

// going to be a post request that uploads the memories for us here 
userMemories.post('/memories', requireUserAuth, createMemoryController);  

// implementing the get route of retrieving users memory pictures. 
userMemories.get('/yourmemories', requireUserAuth, retrieveUsrMemoryController); 

export default userMemories; 