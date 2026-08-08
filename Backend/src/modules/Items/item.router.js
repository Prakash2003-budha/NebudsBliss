import { Router } from "express";
import itemCtr from "./item.controller.js";
import { bodyValidator } from "../../middelware/request.validator.js";
import { ItemCreateDTO, ItemUpdateDTO } from "./item.validator.js";
import { uploader } from "../../middelware/file-handeling.middleware.js";
import allowUser from "../../middelware/auth.middleware.js";
import fileCleanup from "../../middelware/file-cleanup.middleware.js";

const itemRouter = Router();

itemRouter.get('/items', itemCtr.getAllItems);
itemRouter.get('/items/:id', itemCtr.getItemDetail);

// multer must parse the multipart body (populating req.body + req.files) BEFORE
// bodyValidator runs — otherwise validation always sees an empty body and every
// form upload fails. fileCleanup (an error handler) then deletes any files that
// were already written to disk if a later middleware or the controller throws.
itemRouter.post('/items', allowUser("Admin"), uploader().array('images', 5), bodyValidator(ItemCreateDTO), fileCleanup, itemCtr.createItem);
itemRouter.patch('/items/:id', allowUser("Admin"), uploader().array('images', 5), bodyValidator(ItemUpdateDTO), fileCleanup, itemCtr.updateItem);
itemRouter.delete('/items/:id', allowUser("Admin"), itemCtr.deleteItem);

export default itemRouter;