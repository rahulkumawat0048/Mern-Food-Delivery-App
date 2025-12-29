import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { IoIosArrowRoundBack } from "react-icons/io";
import { serverUrl } from "../App";
import DeliveryBoyTracking from "../components/DeliveryBoyTracking";
import { useSelector } from "react-redux";

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const [currentOrder, setcurrentOrder] = useState(null);
  const { socket } = useSelector((state) => state.user);
  const [liveLocation, setliveLocation] = useState({});
  const navigate = useNavigate();

  // ✅ Fetch order details
  const handleGetOrder = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-order-by-id/${orderId}`,
        { withCredentials: true }
      );
      console.log("📦 Order Data:", result.data);
      setcurrentOrder(result.data);
    } catch (error) {
      console.error("❌ Error fetching order:", error);
    }
  };

  // ✅ Listen for real-time delivery boy location updates
  useEffect(() => {
    if (!socket) return;

    const handleLocationUpdate = ({ deliveryBoyId, latitude, longitude }) => {
      console.log("📍 Live Location Update:", deliveryBoyId, latitude, longitude);

      setliveLocation((prev) => ({
        ...prev,
        [deliveryBoyId]: { lat: latitude, lon: longitude },
      }));
    };

    socket.on("update-delivery-location", handleLocationUpdate);

    // Cleanup on unmount
    return () => {
      socket.off("update-delivery-location", handleLocationUpdate);
    };
  }, [socket]);

  // ✅ Initial fetch
  useEffect(() => {
    handleGetOrder();
  }, [orderId]);

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col gap-6">
      {/* Header */}
      <div
        onClick={() => navigate("/my-orders")}
        className="cursor-pointer flex gap-4 items-center mb-2"
      >
        <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
        <h1 className="text-2xl font-bold">Track Order</h1>
      </div>

      {/* Order Details */}
      {currentOrder?.shopOrders?.length > 0 ? (
        currentOrder.shopOrders.map((shopOrder, index) => {
          const deliveryBoy = shopOrder.assignedDeliveryBoy;
          const isDelivered = shopOrder.status === "delivered";

          const deliveryBoyLocation =
            liveLocation[deliveryBoy?._id] ||
            (deliveryBoy?.location?.coordinates
              ? {
                lat: deliveryBoy.location.coordinates[1],
                lon: deliveryBoy.location.coordinates[0],
              }
              : null);

          const customerLocation = currentOrder.deliveryAddress
            ? {
              lat: currentOrder.deliveryAddress.latitude,
              lon: currentOrder.deliveryAddress.longitude,
            }
            : null;

          return (
            <div
              key={index}
              className="bg-white p-4 rounded-2xl shadow-md border border-orange-100 space-y-4"
            >
              {/* Shop Info */}
              <div>
                <p className="text-lg font-bold mb-2 text-[#ff4d2d]">
                  {shopOrder.shop.name}
                </p>
                <p className="font-semibold">
                  <span>Items: </span>
                  {shopOrder.shopOrderItem.map((i) => i.name).join(", ")}
                </p>
                <p>
                  <span className="font-semibold">Subtotal:</span> ₹
                  {shopOrder.subTotal}
                </p>
                <p className="mt-4">
                  <span className="font-semibold">Delivery Address:</span>{" "}
                  {currentOrder.deliveryAddress?.text}
                </p>
              </div>

              {/* Delivery Boy Info */}
              {!isDelivered ? (
                deliveryBoy ? (
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold">
                      Delivery Boy Name: {deliveryBoy.fullName}
                    </p>
                    <p className="font-semibold">
                      Contact: {deliveryBoy.mobile}
                    </p>
                  </div>
                ) : (
                  <p className="font-semibold text-gray-600">
                    Delivery boy not assigned yet.
                  </p>
                )
              ) : (
                <p className="text-green-600 font-semibold text-lg">
                  Delivered ✅
                </p>
              )}

              {/* Map Tracking */}
              {deliveryBoy && !isDelivered && deliveryBoyLocation && customerLocation && (
                <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-md border border-gray-200">
                  <DeliveryBoyTracking
                    data={{
                      deliveryBoyLocation,
                      customerLocation,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })
      ) : (
        <p className="text-gray-500 text-center mt-10">Loading order details...</p>
      )}
    </div>
  );
};

export default TrackOrderPage;
