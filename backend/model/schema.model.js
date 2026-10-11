import mongoose from 'mongoose'; 

// creating the schema below 
const memoriaSchema = new mongoose.Schema({
    userId: { 
        type: String, 
        required: true, 
        index: true
    },  
    imageURL: { 
        type: String, 
        required: true, 
    }, 
    note: String, 
    caption: String, 
    captionStatus: { 
        type: String, 
        enum: ["pending", "failed", "done"], 
        default: "pending"
    }, 
    takenAt: Date, 
    location: { 
         type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: [Number],                                   // [lng, lat]
        placeName: String,
  },
}, { timestamps: true }); 

const MemoriaUserData = mongoose.model('MemoriaUserData', memoriaSchema); 

export default MemoriaUserData; 