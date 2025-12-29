import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import useUpdateLocation from "../hooks/useUpdatelocation";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import ClipLoader from "react-spinners/ClipLoader";
import { showToast } from "../utils/showToast";

const DeliveryBoyDashboard = () => {
  const { userData, socket } = useSelector((state) => state.user);
  const [availableAssignments, setavailableAssignments] = useState([]);
  const [currentOrder, setcurrentOrder] = useState(null);
  const [showOtpBox, setshowOtpBox] = useState(false);
  const [otp, setotp] = useState("");
  const [loadingSendOtp, setloadingSendOtp] = useState(false);
  const [loadingVerifyOtp, setloadingVerifyOtp] = useState(false);
  const [deliveryBoyLocation, setdeliveryBoyLocation] = useState(null);

  // ✅ Real-time location update via socket
  useEffect(() => {
    if (!socket || userData.role !== "deliveryBoy") return;

    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setdeliveryBoyLocation({ lat: latitude, lon: longitude })
          console.log("📍 Sending location update:", latitude, longitude);

          socket.emit("update-location", {
            latitude,
            longitude,
            userId: userData._id,
          });
        },
        (error) => {
          console.log("❌ Geolocation error:", error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    } else {
      console.log("⚠️ Geolocation is not supported by this browser.");
    }

    // Cleanup watcher on unmount
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        console.log("🧹 Cleared location watcher");
      }
    };
  }, [socket, userData]);

  // ✅ Update missing location
  useEffect(() => {
    if (!userData?.location) {
      useUpdateLocation();
    }
  }, [userData]);

  // ✅ Get available assignments
  const getAssignment = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, {
        withCredentials: true,
      });
      setavailableAssignments(result.data || []);
    } catch (error) {
      console.log("❌ Error fetching assignments:", error);
    }
  };

  // ✅ Listen for new assignment events
  useEffect(() => {
    if (!socket || !userData?._id) return;

    const handleNewAssignment = (data) => {
      if (data.sentTo === userData._id) {
        console.log("📦 New assignment received:", data);
        setavailableAssignments((prev) => [...prev, data]);
      }
    };

    socket.on("new-assignment", handleNewAssignment);

    return () => {
      socket.off("new-assignment", handleNewAssignment);
    };
  }, [socket, userData?._id]);

  // ✅ Get current order
  const getCurrentOrder = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-current-order`, {
        withCredentials: true,
      });
      setcurrentOrder(result.data);

      if (result.data?.shopOrder?.deliveryOtp) {
        setshowOtpBox(true);
      }
    } catch (error) {
      console.log("❌ Error fetching current order:", error);
    }
  };

  // ✅ Accept order
  const acceptOrder = async (assignmentId) => {
    try {
      await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`, {
        withCredentials: true,
      });
      showToast("✅ Order accepted successfully!");
      getAssignment();
      getCurrentOrder();
    } catch (error) {
      console.log("❌ Error accepting order:", error);
    }
  };

  // ✅ Send OTP
  const sendOtp = async () => {
    try {
      setloadingSendOtp(true);
      await axios.post(
        `${serverUrl}/api/order/send-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
        },
        { withCredentials: true }
      );

      setshowOtpBox(true);
      showToast("✅ OTP sent successfully to the customer");
    } catch (error) {
      console.log("❌ Error sending OTP:", error);
      showToast("❌ Failed to send OTP");
    } finally {
      setloadingSendOtp(false);
    }
  };

  // ✅ Verify OTP
  const verifyOtp = async () => {
    try {
      setloadingVerifyOtp(true);
      const result = await axios.post(
        `${serverUrl}/api/order/verify-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
          otp,
        },
        { withCredentials: true }
      );
      console.log("✅ OTP verified:", result.data);
      showToast("🎉 Delivery confirmed successfully!");
      setTimeout(() => {
        getCurrentOrder();
        setshowOtpBox(false);
      }, 1000);
    } catch (error) {
      console.log("❌ Error verifying OTP:", error);
      showToast("❌ Error verifying OTP");
    } finally {
      setloadingVerifyOtp(false);
    }
  };

  // ✅ Initial load
  useEffect(() => {
    getAssignment();
    getCurrentOrder();
  }, [userData]);

  return (
    <div className="w-screen min-h-screen bg-[#fff9f6] flex flex-col items-center gap-5 overflow-y-auto">
      <Navbar />

      <div className="w-full max-w-[800px] flex flex-col gap-5 items-center">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-2 items-center w-[90%] border border-gray-200">
          <h1 className="text-2xl font-bold text-[#ff4d2d]">
            Welcome, {userData.fullName}
          </h1>
          <p className="text-sm">
            <span className="font-semibold">Latitude: </span>
            {deliveryBoyLocation?.lat || userData.location?.coordinates[1]} ,{" "}
            <span className="font-semibold">Longitude: </span>
            {deliveryBoyLocation?.lon || userData.location?.coordinates[0]} {" "}
          </p>
        </div>

        {/* Available Orders */}
        {!currentOrder && (
          <div className="bg-white rounded-2xl p-5 w-[90%] border shadow-sm border-gray-200">
            <h1 className="text-lg font-bold mb-4 flex items-center gap-2">
              Available Orders
            </h1>
            <div className="space-y-4">
              {availableAssignments?.length > 0 ? (
                availableAssignments.map((a, index) => (
                  <div
                    className="border rounded-lg p-4 flex justify-between gap-1 items-center"
                    key={index}
                  >
                    <div>
                      <p className="text-sm font-semibold">{a?.shopName}</p>
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Delivery Address: </span>
                        {a?.deliveryAddress.text}
                      </p>
                      <p className="text-xs text-gray-400">
                        {a.items.length} items | ₹{a.subTotal}
                      </p>
                    </div>
                    <button
                      onClick={() => acceptOrder(a.assignmentId)}
                      className="bg-orange-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-orange-600"
                    >
                      Accept
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No Available Orders</p>
              )}
            </div>
          </div>
        )}

        {/* Current Order */}
        {currentOrder && (
          <div className="bg-white rounded-2xl p-5 shadow-sm w-[90%] border border-gray-200">
            <h2 className="text-lg font-bold mb-3">📦 Current Order</h2>
            <div className="border rounded-lg p-4 mb-3">
              <p className="font-semibold text-sm">
                {currentOrder?.shopOrder.shop.name}
              </p>
              <p className="text-sm text-gray-500">
                {currentOrder?.deliveryAddress.text}
              </p>
              <p className="text-xs text-gray-400">
                {currentOrder.shopOrder.shopOrderItem.length} items | ₹
                {currentOrder.shopOrder.subTotal}
              </p>
            </div>

            <DeliveryBoyTracking data={
              {
                deliveryBoyLocation: deliveryBoyLocation || {
                  lat: userData.location.coordinates[1],
                  lon: userData.location.coordinates[0],
                },
                customerLocation: {
                  lat: currentOrder.deliveryAddress.latitude,
                  lon: currentOrder.deliveryAddress.longitude,
                }

              }
            } />

            {!showOtpBox ? (
              <button
                onClick={sendOtp}
                disabled={loadingSendOtp}
                className={`mt-4 w-full flex justify-center items-center gap-2 bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200 ${loadingSendOtp ? "opacity-70 cursor-not-allowed" : ""
                  }`}
              >
                {loadingSendOtp ? (
                  <ClipLoader size={20} color="#fff" />
                ) : (
                  "Mark As Delivered"
                )}
              </button>
            ) : (
              <div className="mt-4 p-4 border rounded-xl bg-gray-50">
                <p className="text-sm font-semibold mb-2">
                  Enter OTP sent to{" "}
                  <span className="text-orange-500">
                    {currentOrder.user.fullName}
                  </span>
                </p>
                <input
                  onChange={(e) => setotp(e.target.value)}
                  placeholder="Enter OTP"
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
                <button
                  onClick={verifyOtp}
                  disabled={loadingVerifyOtp}
                  className={`w-full flex justify-center items-center gap-2 bg-orange-500 mt-1 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all ${loadingVerifyOtp ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                >
                  {loadingVerifyOtp ? (
                    <ClipLoader size={20} color="#fff" />
                  ) : (
                    "Submit OTP"
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryBoyDashboard;
