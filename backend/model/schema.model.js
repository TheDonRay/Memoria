import mongoose from 'mongoose'; 


// GeoJSON point (kept separate so memories without GPS have no location at all)
const pointSchema = new mongoose.Schema({
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },   // [lng, lat]
}, { _id: false });

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
    location: { type: pointSchema, default: undefined },   // GeoJSON { type: 'Point', coordinates: [lng, lat] }
    placeName: String,
}, { timestamps: true });

memoriaSchema.index({ location: '2dsphere' });          // globe queries
memoriaSchema.index({ userId: 1, takenAt: -1 });         // timeline: a user's memories by date

const Memory = mongoose.model('Memory', memoriaSchema); 

export default Memory; 