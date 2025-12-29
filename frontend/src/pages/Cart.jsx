import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { useSelector } from 'react-redux';
import CartItemCard from '../components/CartItemCard';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, totalAmount } = useSelector((state) => state.user);

    return (
        <div className='min-h-screen bg-[#fff9f6] flex justify-center p-6'>
            <div className="w-full max-w-[800px]">

                {/* Back Button + Page Title */}
                <div className="flex items-center gap-[20px] mb-6">
                    <div
                        onClick={() => navigate("/")}
                        className="cursor-pointer"
                    >
                        <IoIosArrowRoundBack size={35} className="text-[#ff4d2d] font-bold" />
                    </div>
                    <h1 className='text-2xl font-bold text-start'>Your Cart</h1>
                </div>

                {/* cart items  */}

                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 gap-4 animate-fadeIn">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/2037/2037454.png"
                            alt="Empty Cart"
                            className="w-[140px] opacity-90"
                        />
                        <h2 className="text-xl font-semibold text-gray-700">Your Cart is Empty</h2>
                        <p className="text-sm text-gray-500 text-center w-[80%]">
                            Looks like you haven't added anything yet. Start exploring and add your favorite delicious food to the cart!
                        </p>

                        <button
                            onClick={() => navigate("/")}
                            className="mt-3 bg-[#ff4d2d] text-white px-6 py-2 rounded-lg hover:bg-[#e33f23] transition-all font-medium shadow-md"
                        >
                            Browse Food Items
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className='animate-fadeIn'>
                            {cartItems?.map((item, index) => (
                                <CartItemCard data={item} key={index} />
                            ))}
                        </div>
                        <div className="mt-6 w-full bg-white rounded-xl shadow flex justify-between items-center border p-4 mx-auto">
                            <div>
                                <h3 className="text-gray-700 font-semibold text-lg">Total Amount</h3>
                                <p className="text-gray-500 text-sm">Including all items in your cart</p>
                            </div>
                            <div>
                                <span className="text-xl font-bold text-[#ff4d2d]">₹ {totalAmount}</span>
                            </div>
                        </div>

                        <div 
                        onClick={()=>navigate("/checkout")}
                        className="my-4 flex justify-end">
                            <button className='bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#e64526] transition cursor-pointer '>Proceed to CheckOut</button>
                        </div>



                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
