import mongoose from "mongoose";

const posterSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    optimizeUrl: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const PosterModel = mongoose.model("Poster", posterSchema);
export default PosterModel;