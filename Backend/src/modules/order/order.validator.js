import Joi from "joi";

export const OrderCreateDTO = Joi.object({
    fullName: Joi.string().trim().min(2).max(100).required().messages({
        "string.base": "Full name must be a text value",
        "string.empty": "Full name is required",
        "string.min": "Full name must be at least 2 characters long",
        "string.max": "Full name cannot exceed 100 characters",
        "any.required": "Full name is required"
    }),

    phone: Joi.string().trim().min(10).max(15).required().messages({
        "string.base": "Phone number must be a text value",
        "string.empty": "Phone number is required",
        "string.min": "Phone number must be at least 10 characters long",
        "string.max": "Phone number cannot exceed 15 characters",
        "any.required": "Phone number is required"
    }),

    email: Joi.string().trim().email().max(254).allow(null, "").messages({
        "string.email": "Please provide a valid email address",
        "string.max": "Email cannot exceed 254 characters"
    }),

    address: Joi.string().trim().min(5).max(250).required().messages({
        "string.empty": "Address is required",
        "string.min": "Address must be at least 5 characters long",
        "string.max": "Address cannot exceed 250 characters",
        "any.required": "Address is required"
    }),

    city: Joi.string().trim().min(2).max(80).required().messages({
        "string.empty": "City is required",
        "string.min": "City must be at least 2 characters long",
        "string.max": "City cannot exceed 80 characters",
        "any.required": "City is required"
    }),

    note: Joi.string().trim().max(500).allow(null, "").messages({
        "string.max": "Order note cannot exceed 500 characters"
    }),

    location: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required()
    }).optional(),

    // Validates that the Google Maps link is a properly formatted URL
    mapLink: Joi.string().trim().uri().max(2048).optional().messages({
        "string.uri": "Map link must be a valid URL",
        "string.max": "Map link cannot exceed 2048 characters"
    }),

    items: Joi.array().items(
        Joi.object({
            productId: Joi.string().required().messages({
                "any.required": "Product ID is required"
            }),
            // name/price are accepted for backward compatibility but are
            // ignored server-side — the service re-reads them from the catalog.
            name: Joi.string().optional(),
            price: Joi.number().min(0).optional(),
            quantity: Joi.number().min(1).required()
        })
    ).min(1).required().messages({
        "array.min": "Cart cannot be empty",
        "any.required": "Items array is required"
    }),

    paymentMethod: Joi.string().valid("cash", "bank").required().messages({
        "any.only": "Payment method must be either cash or bank",
        "any.required": "Payment method is required"
    }),

    // Optional promo code. The actual discount is never accepted from the
    // client — the service re-validates the code and recomputes the amount.
    promoCode: Joi.string().trim().max(30).optional().messages({
        "string.max": "Promo code cannot exceed 30 characters"
    })
});

export const OrderUpdateDTO = Joi.object({
    paymentStatus: Joi.string().valid("pending", "completed", "failed").optional(),
    orderStatus: Joi.string().valid("processing", "shipped", "delivered", "cancelled").optional()
});