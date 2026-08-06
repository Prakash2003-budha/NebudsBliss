import PromoCodeModel from "./promoCode.model.js";

class PromoCodeService {
    /**
     * Returns a clean, client-safe summary of a promo code document.
     */
    getPromoSummary = (promo) => ({
        _id: promo._id,
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        minDiscountAmount: promo.minDiscountAmount || 0,
        maxDiscount: promo.maxDiscount || null,
        expiresAt: promo.expiresAt || null
    });

    /**
     * Core validation shared by the /promo-codes/validate endpoint and the
     * order flow. NEVER trusts client-sent discount values — the amount is
     * always recomputed from the server's own subtotal.
     *
     * Throws an object { code, message, status } when the code is unusable.
     */
    validatePromo = async ({ code, subtotal, userId }) => {
        if (!code || !String(code).trim()) {
            throw { code: 400, message: "Please enter a promo code.", status: "PROMO_REQUIRED" };
        }

        const promo = await PromoCodeModel.findOne({ code: String(code).trim().toUpperCase() });
        if (!promo) {
            throw { code: 404, message: "This promo code is invalid or doesn't exist.", status: "PROMO_INVALID" };
        }

        const now = new Date();

        if (!promo.isActive) {
            throw { code: 400, message: "This promo code has been deactivated.", status: "PROMO_INACTIVE" };
        }
        if (promo.validFrom && now < promo.validFrom) {
            throw { code: 400, message: "This promo code isn't active yet.", status: "PROMO_NOT_STARTED" };
        }
        if (promo.expiresAt && now > promo.expiresAt) {
            throw { code: 400, message: "This promo code has expired.", status: "PROMO_EXPIRED" };
        }
        if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) {
            throw { code: 400, message: "This promo code has reached its usage limit.", status: "PROMO_USED_UP" };
        }
        if (userId) {
            const userUsed = (promo.usedBy || []).filter((id) => String(id) === String(userId)).length;
            if (userUsed >= promo.usagePerUser) {
                throw { code: 400, message: "You've already used this promo code.", status: "PROMO_ALREADY_USED" };
            }
        }

        const subtotalNum = Math.max(0, Number(subtotal) || 0);

        if (subtotalNum < promo.minDiscountAmount) {
            throw {
                code: 400,
                message: `This code needs a minimum order of Rs. ${promo.minDiscountAmount.toLocaleString()}.`,
                status: "PROMO_MIN_NOT_MET"
            };
        }

        let discountAmount;
        if (promo.discountType === "percent") {
            discountAmount = (subtotalNum * promo.discountValue) / 100;
            if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
                discountAmount = promo.maxDiscount;
            }
        } else {
            discountAmount = promo.discountValue;
        }

        // A discount can never exceed the subtotal itself.
        discountAmount = Math.min(discountAmount, subtotalNum);

        return {
            ...this.getPromoSummary(promo),
            discountAmount: Math.round(discountAmount)
        };
    };

    /**
     * Registers one redemption of a code after an order is successfully saved.
     * Used so that a failed order save doesn't burn usage prematurely.
     */
    markUsage = async (code, userId) => {
        if (!code || !userId) return;
        const promo = await PromoCodeModel.findOne({ code: String(code).trim().toUpperCase() });
        if (!promo) return;

        await PromoCodeModel.updateOne(
            { _id: promo._id },
            { $inc: { usedCount: 1 }, $addToSet: { usedBy: userId } }
        );
    };

    // ---- Admin CRUD -------------------------------------------------------

    getPromoCodes = async () => {
        try {
            return await PromoCodeModel.find().sort({ createdAt: -1 });
        } catch (exception) {
            throw exception;
        }
    };

    getPromoCodeById = async (id) => {
        try {
            return await PromoCodeModel.findById(id);
        } catch (exception) {
            throw exception;
        }
    };

    createPromoCode = async (data) => {
        try {
            const promoObj = new PromoCodeModel(data);
            return await promoObj.save();
        } catch (exception) {
            throw exception;
        }
    };

    updatePromoCodeById = async (id, updateData) => {
        try {
            return await PromoCodeModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        } catch (exception) {
            throw exception;
        }
    };

    deletePromoCodeById = async (id) => {
        try {
            return await PromoCodeModel.findByIdAndDelete(id);
        } catch (exception) {
            throw exception;
        }
    };
}

const promoCodeSvc = new PromoCodeService();
export default promoCodeSvc;