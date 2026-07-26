import cloudianarySvc from "../../services/cloudinary.services.js";
import HeroSlideModel from "../heroSlideModel/HeroSlide.model.js";

export const MAX_HERO_SLIDES = 6;

class HeroSlideService {

    getAll = async () => {
        try {
            return await HeroSlideModel.find().sort({ order: 1, createdAt: 1 });
        } catch (exception) {
            throw exception;
        }
    }

    getById = async (id) => {
        try {
            return await HeroSlideModel.findById(id);
        } catch (exception) {
            throw exception;
        }
    }

    countAll = async () => {
        try {
            return await HeroSlideModel.countDocuments();
        } catch (exception) {
            throw exception;
        }
    }

    uploadToCloudinary = async (filePath) => {
        try {
            const upload = await cloudianarySvc.fileUpload(filePath, "hero-slides/");
            return {
                imageUrl: upload.url,
                optimizeUrl: upload.url,
                public_id: upload.public_id,
            };
        } catch (exception) {
            throw exception;
        }
    }

    create = async (imageData) => {
        try {
            const existingCount = await this.countAll();
            const slide = new HeroSlideModel({ ...imageData, order: existingCount });
            return await slide.save();
        } catch (exception) {
            throw exception;
        }
    }

    replaceImage = async (id, imageData) => {
        try {
            const slide = await HeroSlideModel.findById(id);
            if (!slide) return null;

            slide.imageUrl = imageData.imageUrl;
            slide.optimizeUrl = imageData.optimizeUrl;
            slide.public_id = imageData.public_id;
            return await slide.save();
        } catch (exception) {
            throw exception;
        }
    }

    remove = async (id) => {
        try {
            const slide = await HeroSlideModel.findById(id);
            if (!slide) return null;

            await cloudianarySvc.deleteFile(slide.public_id);
            await slide.deleteOne();

            return slide;
        } catch (exception) {
            throw exception;
        }
    }
}

const heroSlideSvc = new HeroSlideService();
export default heroSlideSvc;
