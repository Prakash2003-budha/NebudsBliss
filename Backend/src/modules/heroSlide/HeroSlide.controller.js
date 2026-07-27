import heroSlideSvc, { MAX_HERO_SLIDES } from "./HeroSlide.service.js";
import cloudianarySvc from "../../services/cloudinary.services.js";

const publicSlide = (slide) => ({
    _id: slide._id,
    imageUrl: slide.imageUrl,
    optimizeUrl: slide.optimizeUrl,
    order: slide.order,
});

class HeroSlideController {

    // Public — anyone visiting the site gets the same list of slides.
    getAll = async (req, res, next) => {
        try {
            const slides = await heroSlideSvc.getAll();

            res.json({
                data: slides.map(publicSlide),
                message: "Hero slides fetched successfully",
                status: "FETCH_SUCCESS",
            });
        } catch (exception) {
            next(exception);
        }
    }

    // Admin — add a new slide to the carousel.
    create = async (req, res, next) => {
        let uploadedPublicId = null;
        try {
            if (!req.file) {
                throw { code: 400, message: "No image file provided", status: "NO_FILE" };
            }

            const existingCount = await heroSlideSvc.countAll();
            if (existingCount >= MAX_HERO_SLIDES) {
                cloudianarySvc.removeLocalFile(req.file.path);
                throw {
                    code: 400,
                    message: `You can only have up to ${MAX_HERO_SLIDES} slides.`,
                    status: "MAX_SLIDES_REACHED",
                };
            }

            const imageData = await heroSlideSvc.uploadToCloudinary(req.file.path);
            uploadedPublicId = imageData.public_id;

            const saved = await heroSlideSvc.create(imageData);
            cloudianarySvc.removeLocalFile(req.file.path);

            res.json({
                data: publicSlide(saved),
                message: "Slide added successfully",
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

    // Admin — replace the image of an existing slide (keeps its position).
    replace = async (req, res, next) => {
        let uploadedPublicId = null;
        try {
            if (!req.file) {
                throw { code: 400, message: "No image file provided", status: "NO_FILE" };
            }

            const existing = await heroSlideSvc.getById(req.params.id);
            if (!existing) {
                cloudianarySvc.removeLocalFile(req.file.path);
                throw { code: 404, message: "Slide not found", status: "SLIDE_NOT_FOUND" };
            }

            const oldPublicId = existing.public_id;

            const imageData = await heroSlideSvc.uploadToCloudinary(req.file.path);
            uploadedPublicId = imageData.public_id;

            const saved = await heroSlideSvc.replaceImage(req.params.id, imageData);
            cloudianarySvc.removeLocalFile(req.file.path);

            // Only remove the old image once the new one is safely saved.
            if (oldPublicId) {
                await cloudianarySvc.deleteFile(oldPublicId);
            }

            res.json({
                data: publicSlide(saved),
                message: "Slide updated successfully",
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

    // Admin — remove a slide entirely.
    remove = async (req, res, next) => {
        try {
            const deleted = await heroSlideSvc.remove(req.params.id);

            if (!deleted) {
                throw { code: 404, message: "Slide not found", status: "SLIDE_NOT_FOUND" };
            }

            res.json({
                data: null,
                message: "Slide deleted successfully",
                status: "DELETE_SUCCESS",
            });
        } catch (exception) {
            next(exception);
        }
    }
}

const heroSlideCtr = new HeroSlideController();
export default heroSlideCtr;
