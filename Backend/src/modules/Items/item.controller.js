import itemSvc from "./item.service.js";

class ItemController {
    createItem = async (req, res, next) => {
        try {
            const itemData = await itemSvc.itemDataTransform(req);
            const savedItem = await itemSvc.itemStore(itemData);
            
            res.json({
                data: savedItem,
                message: "Item created successfully",
                status: "CREATE_SUCCESS",
                option: null
            });
        } catch (exception) {
            next(exception);
        }
    }

    getAllItems = async (req, res, next) => {
        try {
            // Optional: extract query params for filtering (e.g., ?category=Starter)
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
        try {
            const existingItem = await itemSvc.getItemById(req.params.id);
            if (!existingItem) {
                throw { code: 404, message: "Item not found", status: "ITEM_NOT_FOUND" };
            }

            const updateData = await itemSvc.itemDataTransform(req);
            const updatedItem = await itemSvc.updateItemById(req.params.id, updateData);

            res.json({
                data: updatedItem,
                message: "Item updated successfully",
                status: "UPDATE_SUCCESS",
                option: null
            });
        } catch (exception) {
            next(exception);
        }
    }

    deleteItem = async (req, res, next) => {
        try {
            const existingItem = await itemSvc.getItemById(req.params.id);
            if (!existingItem) {
                throw { code: 404, message: "Item not found", status: "ITEM_NOT_FOUND" };
            }

            await itemSvc.deleteItemById(req.params.id);
            
            // Optional: Add logic here to delete associated images from Cloudinary if needed

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