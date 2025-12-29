import { count } from "console";
import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";


export const addItem = async (req, res) => {
    try {
        const { name, category, foodType, price } = req.body;
        let image;

        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
            if (!image) return res.status(400).json({ message: "Image upload failed" });
        }

        const shop = await Shop.findOne({ owner: req.userId });
        if (!shop) return res.status(400).json({ message: "Shop not found" });

        const item = await Item.create({
            name,
            category,
            foodType,
            price,
            image,
            shop: shop._id,
        });

        shop.items.push(item._id);
        await shop.save();

        await shop.populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        });

        return res.status(201).json(shop);
    } catch (error) {
        console.error("Add item error:", error);
        return res.status(500).json({ message: `Add item error: ${error.message}` });
    }
};

export const editItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { name, category, foodType, price } = req.body;

        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }

        const updateData = { name, category, foodType, price };
        if (image) updateData.image = image;

        const item = await Item.findByIdAndUpdate(itemId, updateData, { new: true });

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        const shop = await Shop.findOne({ owner: req.userId }).populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        });

        return res.status(200).json(shop);
    } catch (error) {
        console.error("Edit item error:", error);
        return res.status(500).json({ message: `edit item error: ${error.message}` });
    }
};

export const getItemById = async (req, res) => {
    try {
        const { itemId } = req.params;

        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }
        return res.status(200).json(item);
    } catch (error) {
        console.error("Get item error:", error);
        return res.status(500).json({ message: `Get item error: ${error.message}` });
    }
};
export const itemDelete = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const item = await Item.findByIdAndDelete(itemId);

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }
        const shop = await Shop.findOne({ owner: req.userId });

        shop.items = shop.items.filter(
            (i) => i.toString() !== item._id.toString()
        );

        await shop.save();

        // Fetch fresh updated shop with sorted items
        const updatedShop = await Shop.findOne({ owner: req.userId }).populate({
            path: "items",
            options: { sort: { updatedAt: -1 } },
        });

        return res.status(200).json(updatedShop);
    } catch (error) {
        return res
            .status(500)
            .json({ message: `delete item error: ${error.message}` });
    }
};

export const getItemByCity = async (req, res) => {
    try {
        const { state } = req.params;
        if (!state) {
            return res.status(400).json({ message: "state is required" });
        }
        const shops = await Shop.find({
            state: { $regex: new RegExp(`${state}$`, "i") }
        }).populate("items");

        if (!shops || shops.length === 0) {
            return res.status(400).json({ message: "Shops not found in your city" });
        }

        const shopIds = shops.map((shop) => shop._id)
        const items = await Item.find({ shop: { $in: shopIds } })

        return res.status(200).json(items);
    } catch (error) {
        return res
            .status(500)
            .json({ message: `get item by city error: ${error.message}` });
    }
};


export const getItemByShop = async (req, res) => {
    try {
        const { shopId } = req.params;
        const shop = await Shop.findById(shopId).populate("items")
        if (!shop) {
            return res.status(400).json({ message: "shop not found" });
        }
        return res.status(200).json({ shop, items: shop.items });
    } catch (error) {
        return res.status(500).json({ message: `get item by city: ${error.message}` });
    }
};

export const searchItem = async (req, res) => {
    try {
        const { query, state } = req.query;


        if (!query || !state) {
            return null
        }
        const shops = await Shop.find({ state: { $regex: new RegExp(`${state}$`, "i") } }).populate("items");

        if (!shops) {
            return res.status(400).json({ message: "Shops not found in your state" });
        }
        const shopIds = shops.map(s => s._id)
        const items = await Item.find({
            shop: { $in: shopIds },
            $or: [
                { name: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } }
            ]
        })

        return res.status(200).json(items);
    } catch (error) {
        return res.status(500).json({ message: `search item error: ${error.message}` });
    }
};


export const rating = async (req, res) => {
    try {
        const { itemId, rating } = req.body
        if (!itemId || !rating) {
            return res.status(400).json({ message: "itemId and rating is required" })
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "rating must be between 1 to 5" })
        }

        const item = await Item.findById(itemId)
        if (!item) {
            return res.status(400).json({ message: "item not found" })
        }
        const newCount=item.rating.count+1
        const newAverage=(item.rating.average*item.rating.count+rating)/newCount

        item.rating.count=newCount
        item.rating.average=newAverage
        await item.save()

        return res.status(200).json({rating:item.rating});

    } catch (error) {
        return res.status(500).json({ message: "rating error", error: error.message });
    }
};