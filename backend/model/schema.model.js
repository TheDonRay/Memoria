import mongoose from "mongoose";

// GeoJSON point (kept separate so memories without GPS have no location at all)
const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
      // checked here so bad points become a 400 ValidationError instead of a 500 from the 2dsphere index
      // (required alone isn't enough: mongoose defaults arrays to [], which passes required)
      validate: {
        validator: (coords) =>
          coords.length === 2 &&
          coords[0] >= -180 &&
          coords[0] <= 180 &&
          coords[1] >= -90 &&
          coords[1] <= 90,
        message: "coordinates must be [lng, lat] with lng between -180 and 180 and lat between -90 and 90",
      },
    },
  },
  { _id: false },
);

// creating the schema below
const memoriaSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
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
      default: "pending",
    },
    takenAt: Date,
    location: { type: pointSchema, default: undefined }, // GeoJSON { type: 'Point', coordinates: [lng, lat] }
    placeName: String,
  },
  { timestamps: true },
);

memoriaSchema.index({ location: "2dsphere" }); // globe queries
memoriaSchema.index({ userId: 1, takenAt: -1 }); // timeline: a user's memories by date

const Memory = mongoose.model("Memory", memoriaSchema);

export default Memory;
