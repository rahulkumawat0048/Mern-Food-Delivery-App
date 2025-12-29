import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import User from "../models/user.model.js"
import { sendDeliveryOtpMail } from "../utils/mail.js";

export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (
      !deliveryAddress?.text ||
      !deliveryAddress?.latitude ||
      !deliveryAddress?.longitude
    ) {
      return res.status(400).json({ message: "Send complete deliveryAddress" });
    }

    const groupItemByShop = {};

    // Group cart items by shop
    cartItems.forEach((item) => {
      const shopId = item.shop;
      if (!groupItemByShop[shopId]) {
        groupItemByShop[shopId] = [];
      }
      groupItemByShop[shopId].push(item);
    });

    const shopOrders = await Promise.all(
      Object.keys(groupItemByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate("owner");
        if (!shop) {
          throw new Error(`Shop not found for ID: ${shopId}`);
        }

        const items = groupItemByShop[shopId];
        const subTotal = items.reduce(
          (sum, i) => sum + Number(i.price) * Number(i.quantity),
          0
        );

        return {
          shop: shop._id,
          owner: shop.owner._id,
          subTotal,
          shopOrderItem: items.map((i) => ({
            item: i.id,
            price: i.price,
            quantity: i.quantity,
            name: i.name,
          })),
        };
      })
    );

    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders,
    });
    await newOrder.populate("shopOrders.shopOrderItem.item", "name image price")
    await newOrder.populate("shopOrders.shop", "name")
    await newOrder.populate("shopOrders.owner", "name socketId")
    await newOrder.populate("user", "name email mobile")

    // shocket io 
    const io = req.app.get('io')

    if (io) {
      newOrder.shopOrders.forEach(shopOrder => {
        const ownerSocketId = shopOrder.owner.socketId
        if (ownerSocketId) {
          io.to(ownerSocketId).emit('newOrder', {
            _id: newOrder._id,
            paymentMethod: newOrder.paymentMethod,
            user: newOrder.user,
            shopOrders: shopOrder,
            createdAt: newOrder.createdAt,
            deliveryAddress: newOrder.deliveryAddress,
            payment: newOrder.payment
          })
        }
      });
    }




    return res.status(201).json(newOrder);
  } catch (error) {
    console.error("Place order error:", error);
    return res.status(500).json({ message: `place order error: ${error.message}` });
  }
};


export const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (user.role == "user") {

      const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email mobile")
        .populate("shopOrders.shopOrderItem.item", "name image price")
      if (!orders) {
        return res.status(400).json({ message: "Order not found" });
      }

      return res.status(201).json(orders);
    } else if (user.role == "owner") {
      const orders = await Order.find({ "shopOrders.owner": req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("user")
        .populate("shopOrders.shopOrderItem.item", "name image price")
        .populate("shopOrders.assignedDeliveryBoy", "fullName mobile")

      if (!orders) {
        return res.status(400).json({ message: "Order not found" });
      }

      const filteredOrders = orders.map(order => ({
        _id: order._id,
        paymentMethod: order.paymentMethod,
        user: order.user,
        shopOrders: order.shopOrders.find(o => o.owner._id == req.userId),
        createdAt: order.createdAt,
        deliveryAddress: order.deliveryAddress,
        payment: order.payment

      }))


      return res.status(201).json(filteredOrders);
    }


  } catch (error) {
    console.error("get my order error:", error);
    return res.status(500).json({ message: `get my order error: ${error.message}` });
  }
}



export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params;
    const { status } = req.body;

    // ✅ Get socket.io instance early
    const io = req.app.get('io');

    const order = await Order.findById(orderId);
    const shopOrder = order.shopOrders.find(o => o.shop == shopId);
    if (!shopOrder) {
      return res.status(400).json({ message: "Shop order not found" });
    }

    shopOrder.status = status;
    let deliveryBoysPayload;

    // ✅ Handle delivery boy broadcast
    if (status === "out of delivery" && !shopOrder.assignment) {
      const { longitude, latitude } = order.deliveryAddress;

      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [Number(longitude), Number(latitude)] },
            $maxDistance: 20000
          }
        }
      });

      const nearByIds = nearByDeliveryBoys.map(b => b._id);
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["brodcasted", "completed"] }
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyIds.map(id => String(id)));
      const availableBoys = nearByDeliveryBoys.filter(b => !busyIdSet.has(String(b._id)));
      const candidates = availableBoys.map(b => b._id);

      if (candidates.length === 0) {
        await shopOrder.save();
        return res.json({ message: "Order status updated but there are no available delivery boys" });
      }

      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        brodcastedTo: candidates,
        status: "brodcasted",
      });

      await deliveryAssignment.populate("order");
      await deliveryAssignment.populate("shop");

      shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo;
      shopOrder.assignment = deliveryAssignment._id;

      deliveryBoysPayload = availableBoys.map(b => ({
        id: b._id,
        fullName: b.fullName,
        longitude: b.location.coordinates?.[0],
        latitude: b.location.coordinates?.[1],
        mobile: b.mobile
      }));

      // ✅ Emit to all nearby delivery boys
      if (io) {
        availableBoys.forEach(boy => {
          const deliveryBoySocketId = boy.socketId;
          if (deliveryBoySocketId) {
            io.to(deliveryBoySocketId).emit("new-assignment", {
              sentTo:boy._id,
              assignmentId: deliveryAssignment._id,
              orderId: deliveryAssignment.order?._id,
              shopId: deliveryAssignment.shop?._id,
              shopName: deliveryAssignment.shop?.name || "Unknown Shop",
              deliveryAddress: deliveryAssignment.order?.deliveryAddress || "N/A",
              items: deliveryAssignment.order.shopOrders?.find(
                so => so._id.equals(deliveryAssignment.shopOrderId)
              )?.shopOrderItem || [],
              subTotal: deliveryAssignment.order.shopOrders?.find(
                so => so._id.equals(deliveryAssignment.shopOrderId)
              )?.subTotal || 0,
              createdAt: deliveryAssignment.createdAt,
            });
          }
        });
      }
    }

    // ✅ Save order updates
    await shopOrder.save();
    await order.save();

    const updatedShopOrder = order.shopOrders.find(o => o.shop == shopId);

    await order.populate("shopOrders.shop", "name");
    await order.populate("shopOrders.assignedDeliveryBoy", "fullName email mobile");
    await order.populate("user", "socketId");

    // ✅ Emit update to user (real-time)
    if (io && order.user?.socketId) {
      io.to(order.user.socketId).emit("update-status", {
        orderId: order._id,
        shopId: updatedShopOrder.shop._id,
        status: updatedShopOrder.status,
        userId: order.user._id
      });
    }

    return res.status(201).json({
      shopOrder: updatedShopOrder,
      assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
      availableBoys: deliveryBoysPayload,
      assignment: updatedShopOrder?.assignment
    });

  } catch (error) {
    console.error("update order status error:", error);
    return res.status(500).json({ message: `update order status error: ${error.message}` });
  }
};


export const getDeliveryBoyAssignment = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;

    const assignments = await DeliveryAssignment.find({
      brodcastedTo: deliveryBoyId,
      status: "brodcasted",
    })
      .populate("order")
      .populate("shop");

    if (!assignments || assignments.length === 0) {
      return res.status(200).json([]); // no active broadcasts
    }

    const formatted = assignments.map((a) => {
      const shopOrder = a.order?.shopOrders?.find((so) =>
        so._id.equals(a.shopOrderId)
      );

      return {
        assignmentId: a._id,
        orderId: a.order?._id,
        shopId: a.shop?._id,
        shopName: a.shop?.name || "Unknown Shop",
        deliveryAddress: a.order?.deliveryAddress || "N/A",
        items: shopOrder?.shopOrderItem || [],
        subTotal: shopOrder?.subTotal || 0,
        createdAt: a.createdAt,
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("getDeliveryBoyAssignment error:", error);
    return res
      .status(500)
      .json({ message: `get assignment error: ${error.message}` });
  }
};

export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // 1️⃣ Validate ID
    if (!assignmentId) {
      return res.status(400).json({ message: "Assignment ID is required" });
    }

    // 2️⃣ Find the assignment
    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // 3️⃣ Check if assignment is still open for acceptance
    if (assignment.status !== "brodcasted") {
      return res.status(400).json({ message: "Assignment is no longer available" });
    }

    // 4️⃣ Ensure the user doesn't already have another active order
    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $nin: ["brodcasted", "completed", "cancelled"] }
    });

    if (alreadyAssigned) {
      return res.status(409).json({ message: "You are already assigned to another active order" });
    }

    // 5️⃣ Assign delivery boy to assignment
    assignment.assignedTo = req.userId;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();

    // 6️⃣ Update related order
    const order = await Order.findById(assignment.order);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const shopOrder = order.shopOrders.id(assignment.shopOrderId);
    if (!shopOrder) {
      return res.status(404).json({ message: "Shop order not found in this order" });
    }

    shopOrder.assignedDeliveryBoy = req.userId;
    await order.save();

    return res.status(200).json({
      message: "Order successfully accepted",
      assignmentId: assignment._id,
      orderId: order._id
    });

  } catch (error) {
    console.error("Accept order error:", error);
    return res.status(500).json({ message: `Accept order error: ${error.message}` });
  }
};

export const getCurrentOrder = async (req, res) => {
  try {
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: "assigned"
    })
      .populate("shop", "name")
      .populate("assignedTo", "fullName email mobile location")
      .populate({
        path: "order",
        populate: [{ path: "user", select: "fullName email location mobile" },
        { path: "shopOrders.shop", select: "name" }
        ]

      })
    if (!assignment) {
      return res.status(404).json({ message: "assignment not found" });
    }
    if (!assignment.order) {
      return res.status(404).json({ message: "order not found" });
    }

    const shopOrder = assignment.order.shopOrders.find(so => String(so._id) == String(assignment.shopOrderId))
    if (!shopOrder) {
      return res.status(404).json({ message: "shop order not found" });
    }

    let deliveryBoyLocation = { lat: null, lon: null }

    if (assignment.assignedTo.location.coordinates.length == 2) {
      deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1]
      deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0]
    }

    let customerLocation = { lat: null, lon: null }
    if (assignment.order.deliveryAddress) {
      customerLocation.lat = assignment.order.deliveryAddress.latitude
      customerLocation.lon = assignment.order.deliveryAddress.longitude

    }

    return res.status(200).json({
      _id: assignment.order._id,
      user: assignment.order.user,
      shopOrder,
      deliveryAddress: assignment.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation
    })
  } catch (error) {
    return res.status(500).json({ message: `current order error: ${error.message}` });

  }
}

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params
    const order = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "shopOrders.shop",
        model: "Shop"
      })
      .populate({
        path: "shopOrders.assignedDeliveryBoy",
        model: "User"
      })
      .populate({
        path: "shopOrders.shopOrderItem.item",
        model: "Item"
      })
      .lean()

    if (!order) {
      res.status(400).json({ message: "order not found" })
    }

    return res.status(200).json(order)

  } catch (error) {
    return res.status(500).json({ message: `get order by id error: ${error.message}` });
  }
}

export const sendDeliverOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body
    const order = await Order.findById(orderId).populate("user")

    const shopOrder = order.shopOrders.id(shopOrderId)

    if (!order || !shopOrder) {
      return res.status(400).json({ message: "enter valid order/shopOrderId" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    shopOrder.deliveryOtp = otp
    shopOrder.otpExpires = Date.now() + 5 * 60 * 1000
    await order.save()
    await sendDeliveryOtpMail(order.user, otp)

    return res.status(200).json({ message: `otp sent successfully to ${order?.user.fullName}` })
  } catch (error) {
    return res.status(500).json({ message: `send delivery otp error: ${error.message}` });
  }
}


export const verifyDeliverOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body
    const order = await Order.findById(orderId).populate("user")
    const shopOrder = order.shopOrders.id(shopOrderId)

    if (!order || !shopOrder) {
      return res.status(400).json({ message: "enter valid order/shopOrderId" });
    }
    if (shopOrder.deliveryOtp !== otp || !shopOrder.otpExpires || shopOrder.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid/Expired Otp" });
    }
    shopOrder.status = "delivered"
    shopOrder.deliveredAt = Date.now()
    await order.save()
    await DeliveryAssignment.deleteOne({
      shopOrderId: shopOrder._id,
      order: order._id,
      assignedTo: shopOrder.assignedDeliveryBoy
    })

    return res.status(200).json({ message: `Order Delivered Successfully` })
  } catch (error) {
    return res.status(500).json({ message: `verify delivery otp error: ${error.message}` });
  }
}

