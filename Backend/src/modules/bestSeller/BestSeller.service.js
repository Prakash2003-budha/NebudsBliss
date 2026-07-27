import cloudianarySvc from "../../services/cloudinary.services.js";
import BestSellerModel from "../bestSellerModel/BestSeller.model.js";

export const MAX_BEST_SELLER_POSTERS = 8;

class BestSellerService {

    getAll = async () => {
        try {
            return await BestSellerModel.find().sort({ order: 1, createdAt: 1 });
        } catch (exception) {
            throw exception;
        }
    }

    getById = async (id) => {
        try {
            return await BestSellerModel.findById(id);
        } catch (exception) {
            throw exception;
        }
    }

    countAll = async () => {
        try {
            return await BestSellerModel.countDocuments();
        } catch (exception) {
            throw exception;
        }
    }

    uploadToCloudinary = async (filePath) => {
        try {
            const upload = await cloudianarySvc.fileUpload(filePath, "best-sellers/");
            return {
                imageUrl: upload.url,
                optimizeUrl: upload.url,
                public_id: upload.public_id,
            };
        } catch (exception) {
            throw exception;
        }
    }

    create = async (data) => {
        try {
            const existingCount = await this.countAll();
            const poster = new BestSellerModel({ ...data, order: existingCount });
            return await poster.save();
        } catch (exception) {
            throw exception;
        }
    }

    // patch = { name?, itemId?, imageData? } — imageData replaces the image + deletes the old one.
    update = async (id, patch) => {
        try {
            const poster = await BestSellerModel.findById(id);
            if (!poster) return null;

            let oldPublicId = null;

            if (patch.name !== undefined) poster.name = patch.name;
            if (patch.itemId !== undefined) poster.itemId = patch.itemId || null;

            if (patch.imageData) {
                oldPublicId = poster.public_id;
                poster.imageUrl = patch.imageData.imageUrl;
                poster.optimizeUrl = patch.imageData.optimizeUrl;
                poster.public_id = patch.imageData.public_id;
            }

            const saved = await poster.save();

            if (oldPublicId) {
                await cloudianarySvc.deleteFile(oldPublicId);
            }

            return saved;
        } catch (exception) {
            throw exception;
        }
    }

    remove = async (id) => {
        try {
            const poster = await BestSellerModel.findById(id);
            if (!poster) return null;

            await cloudianarySvc.deleteFile(poster.public_id);
            await poster.deleteOne();

            return poster;
        } catch (exception) {
            throw exception;
        }
    }
}

const bestSellerSvc = new BestSellerService();
export default bestSellerSvc;
