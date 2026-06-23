import itemSvc from "./item.service.js";
import cloudianarySvc from "../../services/cloudinary.services.js";

class ItemController {
    createItem = async (req, res, next) => {
    let itemData;
    try {
        itemData = await itemSvc.itemDataTransform(req);
        // Use the new service method
        const savedItem = await itemSvc.itemStoreAndRollback(itemData, req.files);
        
        res.json({ data: savedItem, message: "Item created successfully", status: "CREATE_SUCCESS" });
    } catch (exception) {
        // Only clean up local files here (the service handled Cloudinary)
        if (req.files) {
            req.files.forEach(file => cloudianarySvc.removeLocalFile(file.path));
        }
        next(exception);
    }
}

    getAllItems = async (req, res, next) => {
        try {
            let filter = {};
            if (req.query.category) {
                filter.category = req.query.category;
            }
            if (req.query.isActive) {
                filter.isActive = req.query.isActive === 'true';
            }

            const items = await itemSvc.getAllItems(filter);
            
            res.json({
                data: items,
                message: "Items fetched successfully",
                status: "FETCH_SUCCESS",
                option: null
            });
        } catch (exception) {
            next(exception);
        }
    }

    getItemDetail = async (req, res, next) => {
        try {
            const item = await itemSvc.getItemById(req.params.id);
            if (!item) {
                throw {
                    code: 404,
                    message: "Item not found",
                    status: "ITEM_NOT_FOUND"
                };
            }
            
            res.json({
                data: item,
                message: "Item detail fetched successfully",
                status: "FETCH_SUCCESS",
                option: null
            });
        } catch (exception) {
            next(exception);
        }
    }

    updateItem = async (req, res, next) => {
        let updateData;
        try {
            const existingItem = await itemSvc.getItemById(req.params.id);
            if (!existingItem) {
                // ✅ Item not found — clean up local files before throwing
                if (req.files && req.files.length > 0) {
                    req.files.forEach(file => {
                        cloudianarySvc.removeLocalFile(file.path);
                    });
                }
                throw { code: 404, message: "Item not found", status: "ITEM_NOT_FOUND" };
            }

            updateData = await itemSvc.itemDataTransform(req);
            const updatedItem = await itemSvc.updateItemById(req.params.id, updateData);

            res.json({
                data: updatedItem,
                message: "Item updated successfully",
                status: "UPDATE_SUCCESS",
                option: null
            });
        } catch (exception) {
            // ✅ Clean up local files if still on disk
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    cloudianarySvc.removeLocalFile(file.path);
                });
            }

            // ✅ Roll back any images already uploaded to Cloudinary
            if (updateData && updateData.images && updateData.images.length > 0) {
                for (const img of updateData.images) {
                    if (img.public_id) {
                        await cloudianarySvc.deleteFile(img.public_id);
                    }
                }
            }

            next(exception);
        }
    }

    deleteItem = async (req, res, next) => {
        try {
            const existingItem = await itemSvc.getItemById(req.params.id);
            if (!existingItem) {
                throw { code: 404, message: "Item not found", status: "ITEM_NOT_FOUND" };
            }

            // ✅ Delete all associated Cloudinary images before removing from DB
            if (existingItem.images && existingItem.images.length > 0) {
                for (const img of existingItem.images) {
                    if (img.public_id) {
                        await cloudianarySvc.deleteFile(img.public_id);
                    }
                }
            }

            await itemSvc.deleteItemById(req.params.id);
            
            res.json({
                data: null,
                message: "Item deleted successfully",
                status: "DELETE_SUCCESS",
                option: null
            });
        } catch (exception) {
            next(exception);
        }
    }

}

const itemCtr = new ItemController();
export default itemCtr;