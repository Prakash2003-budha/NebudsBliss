import itemSvc from "./item.service.js";
import cloudianarySvc from "../../services/cloudinary.services.js";

class ItemController {
    createItem = async (req, res, next) => {
    let itemData;
        try {
            itemData = await itemSvc.itemDataTransform(req);
            const savedItem = await itemSvc.itemStore(itemData);

            res.json({
                data: savedItem,
                message: "Item created successfully",
                status: "CREATE_SUCCESS"
            });
        } catch (exception) {
            if (itemData?.images?.length > 0) {
                for (const img of itemData.images) {
                    if (img.public_id) {
                        await cloudianarySvc.deleteFile(img.public_id);
                    }
                }
            }

            // Clean up any local files that weren't processed
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
                // Supports a single category ("Camera") or a comma separated list ("Camera,Fan")
                const categories = req.query.category.split(",").map((c) => c.trim()).filter(Boolean);
                filter.category = categories.length > 1 ? { $in: categories } : categories[0];
            }
            if (req.query.isActive) {
                filter.isActive = req.query.isActive === 'true';
            }
            if (req.query.isFeatured) {
                filter.isFeatured = req.query.isFeatured === 'true';
            }
            if (req.query.brand) {
                const brands = req.query.brand.split(",").map((b) => b.trim()).filter(Boolean);
                filter.brand = brands.length > 1 ? { $in: brands } : brands[0];
            }
            if (req.query.minPrice || req.query.maxPrice) {
                filter.price = {};
                if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
                if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
            }
            if (req.query.search) {
                // Search across name, brand, sku (model number), and category.
                const r = { $regex: req.query.search, $options: "i" };
                filter.$or = [
                    { name: r },
                    { brand: r },
                    { sku: r },
                    { category: r },
                ];
            }

            // --- Spec-based filtering (battery, bluetooth, fast charging, color) ---
            if (req.query.batteryMin) {
                filter["specs.batteryCapacity"] = {
                    ...(filter["specs.batteryCapacity"] || {}),
                    $gte: Number(req.query.batteryMin),
                };
            }
            if (req.query.bluetooth) {
                // e.g. bluetooth=5.3  -> match version 5.3 (regex for flexible matching)
                const v = String(req.query.bluetooth).replace(".", "\\.");
                filter["specs.bluetoothVersion"] = { $regex: v, $options: "i" };
            }
            if (req.query.fastCharging === "true") {
                filter["specs.fastCharging"] = true;
            }
            if (req.query.color) {
                const colors = req.query.color.split(",").map((c) => c.trim()).filter(Boolean);
                if (colors.length > 0) {
                    filter["specs.colorOptions"] = { $in: colors };
                }
            }

            // Storefront availability filters. The shop page sends these so the
            // filters are applied server-side and work WITH pagination (filtering
            // after a paginated fetch would only ever filter the current page).
            if (req.query.stock === "in") {
                filter.stockQuantity = { $gt: 0 };
            } else if (req.query.stock === "out") {
                filter.stockQuantity = { $lte: 0 };
            }
            if (req.query.onSale === "true") {
                // "On sale" = a discount price that is set, positive, and below the price.
                filter.$expr = {
                    $and: [
                        { $ne: ["$discountPrice", null] },
                        { $gt: ["$discountPrice", 0] },
                        { $lt: ["$discountPrice", "$price"] }
                    ]
                };
            }
            if (req.query.isNew === "true") {
                const NEW_WINDOW_MS = 21 * 24 * 60 * 60 * 1000;
                filter.createdAt = { $gte: new Date(Date.now() - NEW_WINDOW_MS) };
            }

            // Pagination is opt-in: only kicks in when the client sends page/limit
            // so existing callers (home page, category page) keep getting a plain array.
            if (req.query.page || req.query.limit) {
                const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
                const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 100);
                const skip = (page - 1) * limit;

                let sort = { createdAt: -1 };
                switch (req.query.sortBy) {
                    case "priceLow":
                        sort = { price: 1 };
                        break;
                    case "priceHigh":
                        sort = { price: -1 };
                        break;
                    case "oldest":
                        sort = { createdAt: 1 };
                        break;
                    case "newest":
                    default:
                        sort = { createdAt: -1 };
                }

                const { items, total } = await itemSvc.getItemsPaginated({ filter, sort, skip, limit });

                return res.json({
                    data: items,
                    message: "Items fetched successfully",
                    status: "FETCH_SUCCESS",
                    option: {
                        page,
                        limit,
                        total,
                        totalPages: Math.max(Math.ceil(total / limit), 1)
                    }
                });
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