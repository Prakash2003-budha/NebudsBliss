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

itemRouter.post('/items', allowUser("Admin"), bodyValidator(ItemCreateDTO), uploader().array('images', 5), itemCtr.createItem, fileCleanup);
itemRouter.patch('/items/:id', allowUser(), bodyValidator(ItemUpdateDTO), uploader().array('images', 5), itemCtr.updateItem);
itemRouter.delete('/items/:id',allowUser(),itemCtr.deleteItem);

export default itemRouter;