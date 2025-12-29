import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart, decreaseQuantity, removeFromCart } from "../redux/userSlice";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import ConfirmPopup from "./ConfirmPopup";

const CartItemCard = ({ data }) => {
    const dispatch = useDispatch();
    const [showPopup, setShowPopup] = useState(false);
    const [actionType, setActionType] = useState(null); // remove | decrease

    const handleDecrease = () => {
        if (data.quantity === 1) {
            setActionType("decrease");
            setShowPopup(true);
        } else {
            dispatch(decreaseQuantity({ id: data.id }));
        }
    };

    const handleRemove = () => {
        setActionType("remove");
        setShowPopup(true);
    };

    const handleConfirm = () => {
        dispatch(removeFromCart({ id: data.id }));
        setShowPopup(false);
    };

    const totalPrice = data.price * data.quantity; // total amount

    return (
        <>
            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm mb-3 border border-[#e3cac5] hover:shadow-lg  transition-all duration-300">
                {/* Image + Name */}
                <div className="flex items-center gap-4">
                    <img
                        src={data.image}
                        alt={data.name}
                        className="w-16 h-16 rounded-xl object-cover shadow-sm"
                    />
                    <div>
                        <h3 className="font-semibold text-lg text-gray-800">{data.name}</h3>
                        <p className="text-sm text-gray-500 font-medium">₹ {data.price} x {data.quantity}</p>
                        <p className="text-sm font-bold text-[#ff4d2d] mt-1">
                            Total: ₹ {totalPrice}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center flex-col sm:flex-row  gap-2 sm:gap-5">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 sm:gap-2 bg-white border border-gray-200 px-1 sm:p-3 py-1 rounded-full shadow-sm">
                        <button
                            onClick={handleDecrease}
                            className="p-1 hover:bg-gray-100 rounded-full"
                        >
                            <FaMinus size={12} />
                        </button>
                        <span className="font-semibold w-6 text-center text-gray-700">
                            {data.quantity}
                        </span>
                        <button
                            onClick={() => dispatch(addToCart({ id: data.id, quantity: 1 }))}
                            className="p-1 hover:bg-gray-100 rounded-full"
                        >
                            <FaPlus size={12} />
                        </button>
                    </div>

                    {/* Remove Button */}
                    <button
                        onClick={handleRemove}
                        className="text-red-500 hover:bg-gray-200 bg-red-100 p-2 rounded-full transition-all"
                    >
                        <FaTrash size={15} />
                    </button>
                </div>
            </div>

            {/* Popup */}
            {showPopup && (
                <ConfirmPopup
                    title={actionType === "remove" ? "Remove Item" : "Remove This Item?"}
                    message={
                        actionType === "remove"
                            ? "Do you really want to remove this item from cart?"
                            : "Quantity is 1. Do you want to remove this item?"
                    }
                    onConfirm={handleConfirm}
                    onCancel={() => setShowPopup(false)}
                />
            )}
        </>
    );
};

export default CartItemCard;
