import Joi from "joi";

const commonFields = {
    code: Joi.string().trim().uppercase().min(2).max(30).messages({
        "string.empty": "Promo code is required",
        "string.min": "Code must be at least 2 characters",
        "string.max": "Code cannot exceed 30 characters"
    }),
    discountType: Joi.string().valid("percent", "fixed").messages({
        "any.only": "Discount type must be either percent or fixed"
    }),
    discountValue: Joi.number().min(1).messages({
        "number.base": "Discount value must be a number",
        "number.min": "Discount value must be at least 1"
    }),
    minDiscountAmount: Joi.number().min(0).allow(null),
    maxDiscount: Joi.number().min(0).allow(null),
    maxUses: Joi.number().min(0).allow(null),
    usagePerUser: Joi.number().min(1).allow(null),
    validFrom: Joi.date().allow(null),
    expiresAt: Joi.date().allow(null),
    isActive: Joi.boolean()
};

export const CreatePromoDTO = Joi.object({
    code: commonFields.code.required(),
    discountType: commonFields.discountType.required(),
    discountValue: commonFields.discountValue.required(),
    minDiscountAmount: commonFields.minDiscountAmount.optional(),
    maxDiscount: commonFields.maxDiscount.optional(),
    maxUses: commonFields.maxUses.optional(),
    usagePerUser: commonFields.usagePerUser.optional(),
    validFrom: commonFields.validFrom.optional(),
    expiresAt: commonFields.expiresAt.optional(),
    isActive: commonFields.isActive.optional()
});

// CRUD from admin — every field optional so a partial update works.
export const UpdatePromoDTO = Joi.object({
    code: commonFields.code.optional(),
    discountType: commonFields.discountType.optional(),
    discountValue: commonFields.discountValue.optional(),
    minDiscountAmount: commonFields.minDiscountAmount.optional(),
    maxDiscount: commonFields.maxDiscount.optional(),
    maxUses: commonFields.maxUses.optional(),
    usagePerUser: commonFields.usagePerUser.optional(),
    validFrom: commonFields.validFrom.optional(),
    expiresAt: commonFields.expiresAt.optional(),
    isActive: commonFields.isActive.optional()
});

export const ValidatePromoDTO = Joi.object({
    code: Joi.string().trim().min(2).max(30).required().messages({
        "string.empty": "Please enter a promo code",
        "any.required": "Please enter a promo code"
    }),
    subtotal: Joi.number().min(0).required().messages({
        "number.min": "Subtotal cannot be negative",
        "any.required": "Subtotal is required"
    })
});