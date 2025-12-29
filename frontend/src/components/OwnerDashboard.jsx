import React from "react";
import Navbar from "./Navbar.jsx";
import { useSelector } from "react-redux";
import { FaUtensils, FaPen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import OwnerItemCard from "./OwnerItemCard.jsx";
import useGetMyShop from "../hooks/useGetMyShop.jsx";
import { motion } from "framer-motion";
import { useEffect } from "react";

const OwnerDashboard = () => {
  useGetMyShop(); // ✅ Correct: hook auto-fetches data
  const navigate=useNavigate()

  const { myShopData, loading, error } = useSelector((state) => state.owner);
  const { userData } = useSelector((state) => state.user);

  

  if (error) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        <div className="text-center text-red-500 font-semibold text-lg">
          ⚠️ Something went wrong. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
      <Navbar />

      {!myShopData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center items-center p-4 mt-10"
        >
          <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
            <div className="flex flex-col items-center text-center">
              <FaUtensils className="text-[#ff4d2d] w-20 h-20 mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Add Your Restaurant
              </h2>
              <p className="text-gray-600 mb-4">
                Join our platform and reach thousands of customers.
              </p>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/create-edit-shop")}
                className="bg-[#ff4d2d] text-white px-6 py-2 rounded-full shadow-md hover:bg-orange-600"
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {myShopData && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full flex flex-col items-center gap-6 px-4 mt-8"
        >
          <h1 className="text-2xl text-gray-900 font-bold flex items-center">
            <FaUtensils className="text-[#ff4d2d] w-10 h-10 animate-pulse mr-2" />
            Welcome to {myShopData.name}
          </h1>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-white shadow-lg rounded-2xl border border-orange-100 w-full max-w-2xl relative"
          >
            <motion.div
              whileHover={{ rotate: 180 }}
              onClick={() => navigate("/create-edit-shop")}
              className="absolute top-4 right-4 bg-[#ff4d2d] text-white p-2 rounded-full shadow-md cursor-pointer"
            >
              <FaPen />
            </motion.div>

            <img
              src={myShopData.image}
              alt={myShopData.name}
              className="w-full h-64 object-cover"
            />

            <div className="p-6">
              <h1 className="text-xl font-bold text-gray-800 mb-2">
                {myShopData.name}
              </h1>
              <p className="text-gray-500">
                {myShopData.city}, {myShopData.state}
              </p>
              <p className="text-gray-500 mb-4">{myShopData.address}</p>
            </div>
          </motion.div>

          {myShopData.items?.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 text-center"
            >
              <div className="justify-center items-center flex flex-col"><FaUtensils className="text-[#ff4d2d] w-20 h-20 mb-2 mt-1 animate-bounce" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Add Your Food Item
              </h2></div>
              <p className="text-gray-600 mb-4">
                Share your delicious creations by adding them to the menu.
              </p>
              <motion.button
                onClick={() => navigate("/add-item")}
                className="bg-[#ff4d2d] text-white px-6 py-2 rounded-full shadow-md hover:bg-orange-600"
              >
                Add Food
              </motion.button>
            </motion.div>
          )}

          {myShopData.items?.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 w-full max-w-2xl mt-6 mb-10"
            >
              {myShopData.items.map((item, index) => (
                <OwnerItemCard data={item} key={index} />
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default OwnerDashboard;
