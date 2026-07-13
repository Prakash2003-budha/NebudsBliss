import Joi from "joi";

export const OrderCreateDTO = Joi.object({
    fullName: Joi.string().min(2).max(100).required().messages({
        "string.base": "Full name must be a text value",
        "string.empty": "Full name is required",
        "string.min": "Full name must be at least 2 characters long",
        "any.required": "Full name is required"
    }),
    
    phone: Joi.string().min(10).max(15).required().messages({
        "string.base": "Phone number must be a text value",
        "string.empty": "Phone number is required",
        "any.required": "Phone number is required"
    }),
    
    email: Joi.string().email().allow(null, "").messages({
        "string.email": "Please provide a valid email address"
    }),
    
    address: Joi.string().min(5).required().messages({
        "string.empty": "Address is required",
        "string.min": "Address must be at least 5 characters long",
        "any.required": "Address is required"
    }),
    
    city: Joi.string().min(2).required().messages({
        "string.empty": "City is required",
        "any.required": "City is required"
    }),
    
    note: Joi.string().allow(null, ""),
    
    location: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required()
    }).optional(),
    
    // Validates that the Google Maps link is a properly formatted URL
    mapLink: Joi.string().uri().optional().messages({
        "string.uri": "Map link must be a valid URL"
    }),
    
    items: Joi.array().items(
        Joi.object({
            productId: Joi.string().required().messages({
                "any.required": "Product ID is required"
            }),
            name: Joi.string().required(),
            quantity: Joi.number().min(1).required(),
            price: Joi.number().min(0).required()
        })
    ).min(1).required().messages({
        "array.min": "Cart cannot be empty",
        "any.required": "Items array is required"
    }),
    
    paymentMethod: Joi.string().valid("cash", "bank").required().messages({
        "any.only": "Payment method must be either cash or bank",
        "any.required": "Payment method is required"
    })
});

export const OrderUpdateDTO = Joi.object({
    paymentStatus: Joi.string().valid("pending", "completed", "failed").optional(),
    orderStatus: Joi.string().valid("processing", "shipped", "delivered", "cancelled").optional()
});