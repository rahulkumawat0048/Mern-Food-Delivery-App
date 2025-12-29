import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import UserOrderCard from '../components/UserOrderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';
import useGetMyOrders from '../hooks/useGetMyOrders';
import { useEffect } from 'react';
import { setMyOrders, updateRealTimeOrderStatus } from '../redux/userSlice';

const MyOrders = () => {
    useGetMyOrders();
    const { userData, myOrders, socket } = useSelector(state => state.user)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    useEffect(() => {
        if (!socket || !userData?._id) return;

        socket?.on("newOrder", (data) => {
            if (data.shopOrders?.owner?._id === userData._id) {
                dispatch(setMyOrders([data, ...myOrders]));
            }
        });

        socket?.on("update-status", ({ orderId, shopId, status, userId }) => {
            if (userId === userData._id) {
                dispatch(updateRealTimeOrderStatus({ orderId, shopId, status }));
            }
        });

        return () => {
            socket?.off("newOrder");
            socket?.off("update-status");
        };
    }, [socket, myOrders, userData?._id]);

    useEffect(() => {

    }, [myOrders]);

    return (
        <div className='w-full min-h-screen bg-[#fff9f6] flex justify-center px-4'>
            <div className="w-full max-w-[800px] p-4">

                {/* back button  */}
                
                <div className="flex items-center gap-[20px] mb-6">
                    <div
                        onClick={() => navigate("/")}
                        className="cursor-pointer"
                    >
                        <IoIosArrowRoundBack size={35} className="text-[#ff4d2d] font-bold" />
                    </div>
                    <h1 className='text-2xl font-bold text-start'>My Orders</h1>
                </div>

                <div className="space-y-6">
                    {myOrders?.map((order) => {
                        if (userData?.role === "user") {
                            return <UserOrderCard key={order._id} data={order} />;
                        } else if (userData?.role === "owner") {
                            return <OwnerOrderCard key={order._id} data={order} />;
                        }
                        return null;
                    })}
                </div>



            </div>

        </div>
    );
}

export default MyOrders;
