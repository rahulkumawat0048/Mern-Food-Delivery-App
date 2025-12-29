import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { addItem, editItem, getItemByCity, getItemById, getItemByShop, itemDelete, rating, searchItem } from "../controllers/item.controller.js";
import { upload } from "../middlewares/multer.js";

const itemRouter=express.Router()

itemRouter.post("/add-item",isAuth,upload.single("image"),addItem)
itemRouter.post("/edit-item/:itemId",isAuth,upload.single("image"),editItem)
itemRouter.post("/delete/:itemId",isAuth,itemDelete)
itemRouter.post("/rating",isAuth,rating)


itemRouter.get("/get-by-id/:itemId",isAuth,getItemById)
itemRouter.get("/get-by-city/:state",isAuth,getItemByCity)
itemRouter.get("/get-by-shop/:shopId",isAuth,getItemByShop)
itemRouter.get("/search-items",isAuth,searchItem)

export default itemRouter