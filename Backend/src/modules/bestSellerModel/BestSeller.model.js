import mongoose from "mongoose";

const bestSellerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: "New Poster",
    },
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
    // The product this poster links to when clicked — optional.
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      default: null,
    },
    // Controls left-to-right order in the carousel.
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const BestSellerModel = mongoose.model("BestSellerPoster", bestSellerSchema);
export default BestSellerModel;
