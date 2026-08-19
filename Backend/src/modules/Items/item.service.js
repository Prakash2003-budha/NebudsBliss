import cloudianarySvc from "../../services/cloudinary.services.js";
import ItemModel from "../ItemModel/item.model.js";

class ItemService {
    itemDataTransform = async (req) => {
        try {
            let data = { ...req.body };

            // Parse specs from flat form-data fields like specs[batteryCapacity],
            // specs[colorOptions], etc. into a nested object.
            if (data.specs) {
                Object.keys(data.specs).forEach((key) => {
                    const val = data.specs[key];
                    // Convert comma-separated colorOptions string into an array
                    if (key === "colorOptions" && typeof val === "string" && val.trim()) {
                        data.specs[key] = val.split(",").map((c) => c.trim()).filter(Boolean);
                    } else if (key === "fastCharging" && typeof val === "string") {
                        data.specs[key] = val.toLowerCase() === "true";
                    } else if (val === "" || val === undefined || val === null) {
                        delete data.specs[key];
                    }
                });
            }

            const basePrice = Number(data.price);

            // discountPercent (0-100). When provided and valid, the discount price
            // is derived automatically so admins can price items by percentage.
            if (
                data.discountPercent !== undefined &&
                data.discountPercent !== null &&
                data.discountPercent !== ""
            ) {
                const pct = Number(data.discountPercent);
                if (
                    Number.isFinite(pct) &&
                    pct > 0 &&
                    pct <= 100 &&
                    Number.isFinite(basePrice) &&
                    basePrice > 0
                ) {
                    data.discountPercent = pct;
                    data.discountPrice =
                        Math.round((basePrice - (basePrice * pct) / 100) * 100) / 100;
                } else {
                    delete data.discountPercent;
                }
            }

            // Normalize discountPrice: only a positive number below the price is a
            // real discount. A blank/zero/invalid value means "no discount" and is
            // REMOVED before saving — storing 0 would make every consumer that uses
            // `discountPrice ?? price` treat the item as free.
            if (
                data.discountPrice === undefined ||
                data.discountPrice === null ||
                data.discountPrice === ""
            ) {
                delete data.discountPrice;
                delete data.discountPercent;
            } else {
                const dPrice = Number(data.discountPrice);
                if (
                    !Number.isFinite(dPrice) ||
                    dPrice <= 0 ||
                    (Number.isFinite(basePrice) && dPrice >= basePrice)
                ) {
                    delete data.discountPrice;
                    delete data.discountPercent;
                } else {
                    data.discountPrice = dPrice;
                    // Re-derive the stored percentage from the final discount price so
                    // the two fields never drift apart (also covers fixed-price edits).
                    if (Number.isFinite(basePrice) && basePrice > 0 && dPrice < basePrice) {
                        data.discountPercent = Math.round(((basePrice - dPrice) / basePrice) * 100);
                    }
                }
            }
            
            // Handle multiple image uploads if files exist
            if (req.files && req.files.length > 0) {
                data.images = [];
                for (let file of req.files) {
                    const upload = await cloudianarySvc.fileUpload(file.path, 'items/');
                    data.images.push({
                        url: upload.url,
                        optimizeUrl: upload.url.replace('/upload/', '/upload/q_auto,f_auto/'),
                        public_id:  upload.public_id
                    });
                }
            }
            return data;
        } catch (exception) {
            throw exception;
        }
    }

    itemStore = async (data) => {
        try {
            const itemObj = new ItemModel(data);
            return await itemObj.save();
        } catch (exception) {
            throw exception;
        }
    }

    getAllItems = async (filter = {}) => {
        try {
            return await ItemModel.find(filter).sort({ createdAt: -1 });
        } catch (exception) {
            throw exception;
        }
    }

    getItemsPaginated = async ({ filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 12 }) => {
        try {
            const [items, total] = await Promise.all([
                ItemModel.find(filter).sort(sort).skip(skip).limit(limit),
                ItemModel.countDocuments(filter)
            ]);
            return { items, total };
        } catch (exception) {
            throw exception;
        }
    }

    getItemById = async (id) => {
        try {
            return await ItemModel.findById(id);
        } catch (exception) {
            throw exception;
        }
    }

    updateItemById = async (id, updateData) => {
        try {
            return await ItemModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        } catch (exception) {
            throw exception;
        }
    }

    deleteItemById = async (id) => {
        try {
            return await ItemModel.findByIdAndDelete(id);
        } catch (exception) {
            throw exception;
        }
    }
itemStoreAndRollback = async (itemData, reqFiles) => {
    try {
        return await this.itemStore(itemData);
    } catch (error) {
        if (itemData.images) {
            for (const img of itemData.images) {
                if (img.public_id) await cloudianarySvc.deleteFile(img.public_id);
            }
        }
        throw error; // Re-throw to controller
    }
};
}

const itemSvc = new ItemService();
export default itemSvc;