import cloudianarySvc from "../services/cloudinary.services.js";

const fileCleanup = async (err, req, res, next) => {
    // 1. Clean up local files if they exist
    if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
            cloudianarySvc.removeLocalFile(file.path);
        });
    }

    // Assuming your uploader adds the uploaded file data to req.uploadedFiles
    if (req.uploadedFiles && req.uploadedFiles.length > 0) {
        for (const file of req.uploadedFiles) {
            if (file.public_id) {
                await cloudianarySvc.deleteFile(file.public_id);
            }
        }
    }
    
    next(err); // Pass error to the next error handler
};

export default fileCleanup;