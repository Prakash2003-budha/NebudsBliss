import cloudianarySvc from "../../services/cloudinary.services.js";
import ItemModel from "./item.model.js";

class ItemService {
    itemDataTransform = async (req) => {
        try {
            let data = { ...req.body };
            
            // Handle multiple image uploads if files exist
            if (req.files && req.files.length > 0) {
                data.images = [];
                for (let file of req.files) {
                    const upload = await cloudianarySvc.fileUpload(file.path, 'items/');
                    data.images.push({
                        url: upload.url,
                        optimizeUrl: upload.secure_url || upload.url
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
}

const itemSvc = new ItemService();
export default itemSvc;