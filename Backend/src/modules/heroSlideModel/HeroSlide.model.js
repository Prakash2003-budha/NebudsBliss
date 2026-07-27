import mongoose from "mongoose";

const heroSlideSchema = new mongoose.Schema(
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
    // Controls left-to-right / dot order in the carousel.
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const HeroSlideModel = mongoose.model("HeroSlide", heroSlideSchema);
export default HeroSlideModel;
