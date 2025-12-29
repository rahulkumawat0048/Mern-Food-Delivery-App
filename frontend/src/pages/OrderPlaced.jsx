import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrderPlaced = ({ orderId, totalAmount }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Optional confetti effect
    import("canvas-confetti").then((confetti) => {
      confetti.default({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-orange-50 to-white px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className="bg-white shadow-2xl rounded-3xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ rotate: -180 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex justify-center"
        >
          <CheckCircle2 className="text-green-500 w-20 h-20 mb-4" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-500 mb-6">
          Thank you for your purchase. Your order is being prepared. You can track your order status in the 'My Orders section.'
        </p>

        

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate("/my-orders")}
            className="bg-[#ff4d2d] hover:bg-[#e64526] text-white font-semibold py-2.5 px-6 rounded-xl shadow-md transition-all duration-200"
          >
            View Orders
          </button>
          <button
            onClick={() => navigate("/")}
            className="border border-[#ff4d2d] text-[#ff4d2d] hover:bg-[#ff4d2d] hover:text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200"
          >
            Continue Shopping
          </button>
        </div>
      </motion.div>

      <p className="text-sm text-gray-400 mt-8">
        Need help?{" "}
        <span
        //   onClick={() => navigate("/support")}
          className="text-[#ff4d2d] cursor-pointer hover:underline"
        >
          Contact Support
        </span>
      </p>
    </div>
  );
};

export default OrderPlaced;
