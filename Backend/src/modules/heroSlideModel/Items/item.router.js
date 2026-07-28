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

itemRouter.post('/items', allowUser("Admin"), uploader().array('images', 5), bodyValidator(ItemCreateDTO), itemCtr.createItem);
itemRouter.patch('/items/:id', allowUser("Admin"), uploader().array('images', 5), bodyValidator(ItemUpdateDTO), itemCtr.updateItem);
itemRouter.delete('/items/:id', allowUser("Admin"), itemCtr.deleteItem);

export default itemRouter;