import axios from 'axios';
import React, { useState } from 'react';
import { MdPhone } from 'react-icons/md';
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { updateOrderStatus } from '../redux/userSlice';

const OwnerOrderCard = ({ data }) => {
  const dispatch = useDispatch();
  const [availableBoys, setAvailableBoys] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = async (orderId, shopId, status) => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true }
      );

      dispatch(updateOrderStatus({ orderId, shopId, status }));
      setAvailableBoys(result?.data?.availableBoys || []);
      console.log(result.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = data?.shopOrders?.status;

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* User Info */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800">{data?.user?.fullName}</h2>
        <p className="text-sm text-gray-500">{data?.user?.email}</p>
        <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
          <MdPhone />
          <span>{data?.user?.mobile}</span>
        </p>
      </div>

      {/* Delivery Address */}
      <div className="flex flex-col gap-2 text-gray-600 text-sm">
        <p>{data?.deliveryAddress?.text}</p>
        <p className="text-xs text-gray-500">
          Lat: {data?.deliveryAddress?.latitude}, Lon: {data?.deliveryAddress?.longitude}
        </p>
      </div>

      {/* Items */}
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {data?.shopOrders?.shopOrderItem.map((item, index) => (
          <div key={index} className="flex-shrink-0 w-40 border rounded-lg p-2 bg-white">
            <img src={item.item.image} alt="" className="w-full h-24 object-cover rounded" />
            <p className="text-sm font-semibold mt-1">{item.name}</p>
            <p className="text-xs text-gray-500">
              Qty: {item.quantity} × ₹{item.price}
            </p>
          </div>
        ))}
      </div>

      {/* Status + Dropdown */}
      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
        <span className="text-sm">
          Status:{' '}
          <span className="font-semibold capitalize text-[#ff4d2d]">
            {currentStatus}
          </span>
        </span>
        <select
          disabled={loading || currentStatus === 'out of delivery'}
          onChange={(e) =>
            handleUpdateStatus(data._id, data?.shopOrders?.shop?._id, e.target.value)
          }
          className="rounded-md border px-3 py-1 text-sm focus:outline-none focus:ring-1 ring-[#ff4d2d] disabled:opacity-50"
        >
          <option value="">Change</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="out of delivery">Out Of Delivery</option>
        </select>
      </div>

      {/* Delivery Boy Section */}
      {currentStatus === 'out of delivery' && (
        <div className="mt-3 p-2 border rounded-lg text-sm bg-orange-50">
          {data.shopOrders.assignedDeliveryBoy ? (
            <p className="mb-1 font-medium text-gray-700">Assigned Delivery Boy</p>
          ) : (
            <p className="mb-1 font-medium text-gray-700">Available Delivery Boys</p>
          )}

          {availableBoys?.length > 0 ? (
            availableBoys.map((b, index) => (
              <div key={index} className="text-gray-600">
                {b.fullName} - {b.mobile}
              </div>
            ))
          ) : data?.shopOrders?.assignedDeliveryBoy ? (
            <div>
              {data?.shopOrders?.assignedDeliveryBoy?.fullName} -{' '}
              {data?.shopOrders?.assignedDeliveryBoy?.mobile}
            </div>
          ) : (
            <div className="text-gray-500">Waiting for delivery boy to accept...</div>
          )}
        </div>
      )}

      {/* Total */}
      <div className="text-right font-bold text-sm text-gray-800">
        Total: ₹{data.shopOrders.subTotal}
      </div>
    </div>
  );
};

export default OwnerOrderCard;
