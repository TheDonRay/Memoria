import { getAuth } from '@clerk/express';
// import the service file here
import { createMemoryService } from '../services/memory.service.js';

export const createMemoryController = async (req, res) => {
    //set up try and catch case and call service file with the userId
    try {
        // userId comes from the verified token (requireUserAuth already blocked unsigned users)
        const {userId} = getAuth(req);
        // captionStatus is left out on purpose, the server controls it (defaults to "pending")
        const {imageURL, note, caption, takenAt, location, placeName } = req.body;

        if (!imageURL) {
            return res.status(400).json({
                error: "imageURL is required"
            });
        }

        // call our service function with this data
        const newMemory = await createMemoryService(userId, { imageURL, note, caption, takenAt, location, placeName });
        return res.status(201).json(newMemory);
    } catch (error) {
        // schema validation errors are the client's fault, anything else is a server error
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: error.message
            });
        }
        console.error("Error creating memory", error.message); 
        // otherwise we get 
        return res.status(500).json({
            error: "Failed to create memory"
        });
    }
}; 

