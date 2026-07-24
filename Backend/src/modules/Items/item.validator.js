import Joi from "joi";
import { ItemCategory } from "../../config/constants.js";

export const ItemCreateDTO = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        "string.base": "Item name must be a text value",
        "string.empty": "Item name is required",
        "string.min": "Item name must be at least 2 characters long",
        "string.max": "Item name cannot exceed 100 characters",
        "any.required": "Item name is required"
    }),
    description: Joi.string().min(10).required().messages({
        "string.base": "Description must be a text value",
        "string.empty": "Description is required",
        "string.min": "Description must be at least 10 characters long",
        "any.required": "Description is required"
    }),
    price: Joi.number().min(0).required().messages({
        "number.base": "Price must be a number",
        "number.min": "Price cannot be negative",
        "any.required": "Price is required"
    }),
    discountPrice: Joi.number().min(0).allow(null, "").messages({
        "number.base": "Discount price must be a number",
        "number.min": "Discount price cannot be negative"
    }),
    sku: Joi.string().required().messages({
        "string.base": "SKU must be a text value",
        "string.empty": "SKU is required",
        "any.required": "SKU is required"
    }),
    category: Joi.string().valid(...Object.values(ItemCategory)).required().messages({
        "string.base": "Category must be a text value",
        "any.only": "Please select a valid category from the allowed list",
        "any.required": "Category is required"
    }),
    brand: Joi.string().allow(null, "").messages({
        "string.base": "Brand must be a text value"
    }),
    stockQuantity: Joi.number().min(0).required().messages({
        "number.base": "Stock quantity must be a number",
        "number.min": "Stock cannot be negative",
        "any.required": "Stock quantity is required"
    }),
    isActive: Joi.boolean().default(true).messages({
        "boolean.base": "isActive must be a boolean value"
    }),
    isFeatured: Joi.boolean().default(false).messages({
        "boolean.base": "isFeatured must be a boolean value"
    })
});

export const ItemUpdateDTO = ItemCreateDTO.fork(
    ['name', 'description', 'price', 'sku', 'category', 'stockQuantity'], 
    (schema) => schema.optional()
);