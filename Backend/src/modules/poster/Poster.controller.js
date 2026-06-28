import posterSvc from "./Poster.service.js";
import cloudianarySvc from "../../services/cloudinary.services.js";

class PosterController {

    getPoster = async (req, res, next) => {
        try {
            const poster = await posterSvc.getPoster();

            res.json({
                data: poster
                    ? { imageUrl: poster.imageUrl, optimizeUrl: poster.optimizeUrl }
                    : null,
                message: "Poster fetched successfully",
                status: "FETCH_SUCCESS",
            });
        } catch (exception) {
            next(exception);
        }
    }

    uploadPoster = async (req, res, next) => {
        let uploadedPublicId = null;
        try {
            if (!req.file) {
                throw { code: 400, message: "No image file provided", status: "NO_FILE" };
            }

            // Delete the OLD poster from Cloudinary before uploading the new one
            const existing = await posterSvc.getPoster();
            if (existing?.public_id) {
                await cloudianarySvc.deleteFile(existing.public_id);
            }

            // Upload new image
            const imageData = await posterSvc.uploadToCloudinary(req.file.path);
            uploadedPublicId = imageData.public_id;

            // Persist to DB (upsert)
            const saved = await posterSvc.savePoster(imageData);

            // Clean up local temp file
            cloudianarySvc.removeLocalFile(req.file.path);

            res.json({
                data: { imageUrl: saved.imageUrl, optimizeUrl: saved.optimizeUrl },
                message: "Poster uploaded successfully",
                status: "UPLOAD_SUCCESS",
            });
        } catch (exception) {
            // Roll back Cloudinary upload if DB save failed
            if (uploadedPublicId) {
                await cloudianarySvc.deleteFile(uploadedPublicId);
            }
            // Clean up local temp file
            if (req.file?.path) {
                cloudianarySvc.removeLocalFile(req.file.path);
            }
            next(exception);
        }
    }

    deletePoster = async (req, res, next) => {
        try {
            const deleted = await posterSvc.deletePoster();

            if (!deleted) {
                throw { code: 404, message: "No poster found", status: "POSTER_NOT_FOUND" };
            }

            res.json({
                data: null,
                message: "Poster deleted successfully",
                status: "DELETE_SUCCESS",
            });
        } catch (exception) {
            next(exception);
        }
    }
}

const posterCtr = new PosterController();
export default posterCtr;