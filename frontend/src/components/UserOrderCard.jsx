import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { serverUrl } from '../App';

const UserOrderCard = ({ data }) => {
  const navigate = useNavigate();
  const [selectedRating, setSelectedRating] = useState({});

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const handleRating = async (itemId, rating) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/item/rating`,
        { itemId, rating },
        { withCredentials: true }
      );
      console.log(result.data);

      setSelectedRating((prev) => ({
        ...prev,
        [itemId]: rating
      }));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex justify-between border-b border-gray-600 pb-2">
        <div>
          <p className="font-semibold">Order #{data?._id?.slice(-6)}</p>
          <p className="text-sm text-gray-500">
            Date: {formatDate(data?.createdAt)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">
            {data?.paymentMethod?.toUpperCase()}
          </p>

          {/* FIXED SAFE ACCESS */}
          <p className="font-medium text-blue-600">
            {data?.shopOrders?.[0]?.status || "Pending"}
          </p>
        </div>
      </div>

      {data?.shopOrders?.map((shopOrder, index) => (
        <div
          className="border rounded-lg border-gray-300 p-3 bg-[#fffaf7] space-y-3"
          key={index}
        >
          <p>{shopOrder?.shop?.name}</p>

          <div className="flex space-x-4 overflow-x-auto pb-2">
            {shopOrder?.shopOrderItem?.map((item, idx) => (
              <div
                className="flex-shrink-0 w-40 border rounded-lg p-2 bg-white"
                key={idx}
              >
                <img
                  src={item?.item?.image}
                  alt=""
                  className="w-full h-24 object-cover rounded"
                />

                <p className="text-sm font-semibold mt-1">{item?.name}</p>
                <p className="text-xs text-gray-500">
                  Qty: {item?.quantity} x ₹{item?.price}
                </p>

                {/* SAFE CHECK */}
                {shopOrder?.status === "delivered" && (
                  <div className="flex space-x-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`text-lg ${
                          selectedRating[item?.item?._id] >= star
                            ? "text-yellow-400"
                            : "text-gray-400"
                        }`}
                        onClick={() =>
                          handleRating(item?.item?._id, star)
                        }
                      >
                        ★
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center border-t border-gray-500 pt-2">
            <p className="font-semibold">Subtotal: ₹{shopOrder?.subTotal}</p>
            <span className="text-sm font-medium text-blue-600">
              {shopOrder?.status}
            </span>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center border-t pt-2 border-gray-600">
        <p className="font-semibold">Total: ₹{data?.totalAmount}</p>

        <button
          onClick={() => navigate(`/track-order/${data?._id}`)}
          className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm"
        >
          Track Order
        </button>
      </div>
    </div>
  );
};

export default UserOrderCard;
