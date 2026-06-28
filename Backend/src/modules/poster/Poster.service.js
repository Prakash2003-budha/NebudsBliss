import cloudianarySvc from "../../services/cloudinary.services.js";
import PosterModel from "../posterModel/Poster.model.js";

class PosterService {

    getPoster = async () => {
        try {
            return await PosterModel.findOne().sort({ createdAt: -1 });
        } catch (exception) {
            throw exception;
        }
    }

    uploadToCloudinary = async (filePath) => {
        try {
            const upload = await cloudianarySvc.fileUpload(filePath, "poster/");
            return {
                imageUrl: upload.url,
                optimizeUrl: upload.url,
                public_id: upload.public_id,
            };
        } catch (exception) {
            throw exception;
        }
    }

    savePoster = async (imageData) => {
        try {
            // Only one poster lives in the DB — upsert in place
            const existing = await PosterModel.findOne().sort({ createdAt: -1 });

            if (existing) {
                existing.imageUrl    = imageData.imageUrl;
                existing.optimizeUrl = imageData.optimizeUrl;
                existing.public_id   = imageData.public_id;
                return await existing.save();
            }

            const posterObj = new PosterModel(imageData);
            return await posterObj.save();
        } catch (exception) {
            throw exception;
        }
    }

    deletePoster = async () => {
        try {
            const poster = await PosterModel.findOne().sort({ createdAt: -1 });
            if (!poster) return null;

            await cloudianarySvc.deleteFile(poster.public_id);
            await poster.deleteOne();

            return poster;
        } catch (exception) {
            throw exception;
        }
    }
}

const posterSvc = new PosterService();
export default posterSvc;