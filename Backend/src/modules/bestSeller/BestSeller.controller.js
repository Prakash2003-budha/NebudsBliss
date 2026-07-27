import bestSellerSvc, { MAX_BEST_SELLER_POSTERS } from "./BestSeller.service.js";
import cloudianarySvc from "../../services/cloudinary.services.js";

const publicPoster = (poster) => ({
    _id: poster._id,
    name: poster.name,
    imageUrl: poster.imageUrl,
    optimizeUrl: poster.optimizeUrl,
    itemId: poster.itemId || null,
    order: poster.order,
});

class BestSellerController {

    // Public — every visitor sees the same curated posters.
    getAll = async (req, res, next) => {
        try {
            const posters = await bestSellerSvc.getAll();

            res.json({
                data: posters.map(publicPoster),
                message: "Best seller posters fetched successfully",
                status: "FETCH_SUCCESS",
            });
        } catch (exception) {
            next(exception);
        }
    }

    // Admin — add a new poster.
    create = async (req, res, next) => {
        let uploadedPublicId = null;
        try {
            if (!req.file) {
                throw { code: 400, message: "No image file provided", status: "NO_FILE" };
            }

            const existingCount = await bestSellerSvc.countAll();
            if (existingCount >= MAX_BEST_SELLER_POSTERS) {
                cloudianarySvc.removeLocalFile(req.file.path);
                throw {
                    code: 400,
                    message: `You can only have up to ${MAX_BEST_SELLER_POSTERS} posters.`,
                    status: "MAX_POSTERS_REACHED",
                };
            }

            const imageData = await bestSellerSvc.uploadToCloudinary(req.file.path);
            uploadedPublicId = imageData.public_id;

            const name = (req.body.name || "").trim() || "New Poster";
            const itemId = req.body.itemId || null;

            const saved = await bestSellerSvc.create({ ...imageData, name, itemId });
            cloudianarySvc.removeLocalFile(req.file.path);

            res.json({
                data: publicPoster(saved),
                message: "Poster added successfully",
                status: "CREATE_SUCCESS",
            });
        } catch (exception) {
            if (uploadedPublicId) {
                await cloudianarySvc.deleteFile(uploadedPublicId);
            }
            if (req.file?.path) {
                cloudianarySvc.removeLocalFile(req.file.path);
            }
            next(exception);
        }
    }

    // Admin — update a poster's name, linked product, and/or image (any subset).
    update = async (req, res, next) => {
        let uploadedPublicId = null;
        try {
            const existing = await bestSellerSvc.getById(req.params.id);
            if (!existing) {
                if (req.file?.path) cloudianarySvc.removeLocalFile(req.file.path);
                throw { code: 404, message: "Poster not found", status: "POSTER_NOT_FOUND" };
            }

            const patch = {};
            if (req.body.name !== undefined) patch.name = (req.body.name || "").trim() || "New Poster";
            if (req.body.itemId !== undefined) patch.itemId = req.body.itemId || null;

            if (req.file) {
                const imageData = await bestSellerSvc.uploadToCloudinary(req.file.path);
                uploadedPublicId = imageData.public_id;
                patch.imageData = imageData;
            }

            const saved = await bestSellerSvc.update(req.params.id, patch);
            if (req.file?.path) cloudianarySvc.removeLocalFile(req.file.path);

            res.json({
                data: publicPoster(saved),
                message: "Poster updated successfully",
                status: "UPDATE_SUCCESS",
            });
        } catch (exception) {
            if (uploadedPublicId) {
                await cloudianarySvc.deleteFile(uploadedPublicId);
            }
            if (req.file?.path) {
                cloudianarySvc.removeLocalFile(req.file.path);
            }
            next(exception);
        }
    }

    // Admin — remove a poster entirely.
    remove = async (req, res, next) => {
        try {
            const deleted = await bestSellerSvc.remove(req.params.id);

            if (!deleted) {
                throw { code: 404, message: "Poster not found", status: "POSTER_NOT_FOUND" };
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

const bestSellerCtr = new BestSellerController();
export default bestSellerCtr;
