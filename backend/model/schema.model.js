import mongoose from 'mongoose';

// GeoJSON point (kept separate so memories without GPS have no location at all)
const pointSchema = new mongoose.Schema({
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },   // [lng, lat]
}, { _id: false });

// creating the schema below
const memorySchema = new mongoose.Schema({
    userId: {                       // Clerk user ID
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
    location: { type: pointSchema, default: undefined },
    placeName: String,
}, { timestamps: true });

memorySchema.index({ location: '2dsphere' });       // globe queries
memorySchema.index({ userId: 1, takenAt: -1 });     // timeline: a user's memories by date

const Memory = mongoose.model('Memory', memorySchema);

export default Memory;
