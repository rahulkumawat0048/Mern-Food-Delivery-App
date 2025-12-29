import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import ForgotPassword from './pages/ForgotPassword';
import useGetCurrentUser from './hooks/useGetCurrentUser';
import { useDispatch, useSelector } from 'react-redux';
import Home from './pages/Home';
import useGetCity from './hooks/useGetCity';
import useGetMyShop from './hooks/useGetMyShop';
import CreateEditShop from './pages/CreateEditShop';
import AddItem from './pages/AddItem';
import EditItem from './pages/EditItem';
import useGetShopByCity from './hooks/useGetShopByCity';
import useGetItemByCity from './hooks/useGetItemByCity';
import Cart from './pages/Cart';
import CheckOut from './pages/CheckOut';
import OrderPlaced from './pages/OrderPlaced';
import useGetMyOrders from './hooks/useGetMyOrders';
import MyOrders from './pages/MyOrders';
import useUpdateLocation from './hooks/useUpdatelocation';
import TrackOrderPage from './pages/TrackOrderPage';
import Shop from './pages/Shop';
import CategoryItems from './pages/CategoryItems';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { setSocket } from './redux/userSlice';
import { motion } from "framer-motion";
import logo from "./assets/logo.png";


export const serverUrl = "http://localhost:8000";

function App() {
  const { loading } = useGetCurrentUser();
  const { userData, cartItems } = useSelector((state) => state.user);
  const dispatch = useDispatch()
  useGetMyShop()
  useGetCity()
  useGetShopByCity()
  useGetItemByCity()
  useGetMyOrders()
  useUpdateLocation()

  useEffect(() => {
    const socketInstance = io(serverUrl, { withCredentials: true })
    dispatch(setSocket(socketInstance))
    socketInstance.on('connect', () => {
      if (userData) {
        socketInstance.emit('identity', { userId: userData._id })
      }
    })
  }, []);

  // 🔹 Show loader while checking auth
  // if (loading) {
  //   return (
  //     <div className="w-full min-h-screen flex top-0 absolute justify-center items-center bg-[#fff9f6]">
  //       <motion.img
  //         src={logo}
  //         alt="TazaBite Logo"
  //         className="w-24 h-24 rounded-xl "
  //         animate={{
  //           y: [0, -15, 0],
  //         }}
  //         transition={{
  //           duration: 1,
  //           repeat: Infinity,
  //           ease: "easeInOut",
  //         }}
  //       />
  //     </div>
  //   );
  // }

  return (
    <Routes>
      <Route path="/signup" element={!userData ? <SignUp /> : <Navigate to="/" />} />
      <Route path="/signin" element={!userData ? <SignIn /> : <Navigate to="/" />} />
      <Route path="/forgot-password" element={!userData ? <ForgotPassword /> : <Navigate to="/" />} />
      <Route path="/" element={userData ? <Home /> : <Navigate to="/signin" />} />
      <Route path="/create-edit-shop" element={userData ? <CreateEditShop /> : <Navigate to="/signin" />} />
      <Route path="/add-item" element={userData ? <AddItem /> : <Navigate to="/signin" />} />
      <Route path="/edit-item/:itemId" element={userData ? <EditItem /> : <Navigate to="/signin" />} />
      <Route path="/cart" element={userData ? <Cart /> : <Navigate to="/signin" />} />
      <Route
        path="/checkout"
        element={
          userData ? (
            cartItems.length > 0 ? <CheckOut /> : <Navigate to="/cart" />
          ) : (
            <Navigate to="/signin" />
          )
        }
      />
      <Route path="/order-placed" element={userData ? <OrderPlaced /> : <Navigate to="/signin" />} />
      <Route path="/my-orders" element={userData ? <MyOrders /> : <Navigate to="/signin" />} />
      <Route path="/track-order/:orderId" element={userData ? <TrackOrderPage /> : <Navigate to="/signin" />} />
      <Route path="/shop/:shopId" element={userData ? <Shop /> : <Navigate to="/signin" />} />
      <Route path="/category/:category" element={userData ? <CategoryItems /> : <Navigate to="/signin" />} />
    </Routes>
  );
};

export default App;
