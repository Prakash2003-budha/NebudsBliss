import { Router } from "express";
import promoCodeCtr from "./promoCode.controller.js";
import allowUser from "../../middelware/auth.middleware.js";
import { bodyValidator } from "../../middelware/request.validator.js";
import { CreatePromoDTO, UpdatePromoDTO, ValidatePromoDTO } from "./promoCode.validator.js";

const promoRouter = Router();

// Any logged-in user can validate a code against their current subtotal.
promoRouter.post(
    "/promo-codes/validate",
    allowUser(),
    bodyValidator(ValidatePromoDTO),
    promoCodeCtr.validatePromo
);

// Admin CRUD
promoRouter.get("/promo-codes", allowUser("Admin"), promoCodeCtr.getPromoCodes);
promoRouter.post("/promo-codes", allowUser("Admin"), bodyValidator(CreatePromoDTO), promoCodeCtr.createPromo);
promoRouter.patch("/promo-codes/:id", allowUser("Admin"), bodyValidator(UpdatePromoDTO), promoCodeCtr.updatePromo);
promoRouter.delete("/promo-codes/:id", allowUser("Admin"), promoCodeCtr.deletePromo);

export default promoRouter;