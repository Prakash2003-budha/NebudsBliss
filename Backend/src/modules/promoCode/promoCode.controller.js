import promoCodeSvc from "./promoCode.service.js";

class PromoCodeController {
    // Validates a code against a client-supplied subtotal (used for live UX).
    // Requires login so the per-user usage rule can be checked too.
    validatePromo = async (req, res, next) => {
        try {
            const promo = await promoCodeSvc.validatePromo({
                code: req.body.code,
                subtotal: req.body.subtotal,
                userId: req.authUser?._id
            });

            res.json({
                data: promo,
                message: "Promo code applied successfully",
                status: "PROMO_VALID",
                option: null
            });
        } catch (exception) {
            next(exception);
        }
    };

    // ---- Admin CRUD -------------------------------------------------------

    getPromoCodes = async (req, res, next) => {
        try {
            const promoCodes = await promoCodeSvc.getPromoCodes();
            res.json({
                data: promoCodes,
                message: "Promo codes fetched successfully",
                status: "FETCH_SUCCESS",
                option: null
            });
        } catch (exception) {
            next(exception);
        }
    };

    createPromo = async (req, res, next) => {
        try {
            // Store the code uppercase/trimmed consistently.
            if (req.body.code) {
                req.body.code = String(req.body.code).trim().toUpperCase();
            }
            const saved = await promoCodeSvc.createPromoCode(req.body);

            res.json({
                data: saved,
                message: "Promo code created successfully",
                status: "CREATE_SUCCESS",
                option: null
            });
        } catch (exception) {
            next(exception);
        }
    };

    updatePromo = async (req, res, next) => {
        try {
            const existing = await promoCodeSvc.getPromoCodeById(req.params.id);
            if (!existing) {
                throw { code: 404, message: "Promo code not found", status: "PROMO_NOT_FOUND" };
            }

            if (req.body.code) {
                req.body.code = String(req.body.code).trim().toUpperCase();
            }
            // Admin can reset usage counters via the null fields for maxUses/
            // usagePerUser; guard against wiping maxUses accidentally by only
            // ever setting provided keys.
            const patched = { ...req.body };
            delete patched.usedCount;
            delete patched.usedBy;

            const updated = await promoCodeSvc.updatePromoCodeById(req.params.id, patched);

            res.json({
                data: updated,
                message: "Promo code updated successfully",
                status: "UPDATE_SUCCESS",
                option: null
            });
        } catch (exception) {
            next(exception);
        }
    };

    deletePromo = async (req, res, next) => {
        try {
            const existing = await promoCodeSvc.getPromoCodeById(req.params.id);
            if (!existing) {
                throw { code: 404, message: "Promo code not found", status: "PROMO_NOT_FOUND" };
            }

            await promoCodeSvc.deletePromoCodeById(req.params.id);

            res.json({
                data: null,
                message: "Promo code deleted successfully",
                status: "DELETE_SUCCESS",
                option: null
            });
        } catch (exception) {
            next(exception);
        }
    };
}

const promoCodeCtr = new PromoCodeController();
export default promoCodeCtr;