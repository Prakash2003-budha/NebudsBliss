import Joi from "joi";

const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/, "ObjectId").messages({
    "string.pattern.name": "Item id must be a valid ObjectId",
    "string.empty": "Item is required",
    "any.required": "Item is required"
});

export const ReviewCreateDTO = Joi.object({
    item: objectId.required().messages({
        "any.required": "Item is required",
        "string.empty": "Item is required"
    }),
    rating: Joi.number().integer().min(1).max(5).required().messages({
        "number.base": "Rating must be a number",
        "number.integer": "Rating must be a whole number",
        "number.min": "Rating must be at least 1",
        "number.max": "Rating cannot exceed 5",
        "any.required": "Rating is required"
    }),
    title: Joi.string().max(80).allow(null, "").messages({
        "string.max": "Review title cannot exceed 80 characters"
    }),
    comment: Joi.string().min(3).max(1000).required().messages({
        "string.base": "Comment must be a text value",
        "string.empty": "Review comment is required",
        "string.min": "Review must be at least 3 characters long",
        "string.max": "Review cannot exceed 1000 characters",
        "any.required": "Review comment is required"
    })
});

export const ReviewUpdateDTO = Joi.object({
    rating: Joi.number().integer().min(1).max(5).optional().messages({
        "number.base": "Rating must be a number",
        "number.integer": "Rating must be a whole number",
        "number.min": "Rating must be at least 1",
        "number.max": "Rating cannot exceed 5"
    }),
    title: Joi.string().max(80).allow(null, "").optional().messages({
        "string.max": "Review title cannot exceed 80 characters"
    }),
    comment: Joi.string().min(3).max(1000).optional().messages({
        "string.base": "Comment must be a text value",
        "string.empty": "Review comment is required",
        "string.min": "Review must be at least 3 characters long",
        "string.max": "Review cannot exceed 1000 characters"
    })
}).min(1);