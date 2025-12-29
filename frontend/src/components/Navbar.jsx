import React, { useState, useEffect, useCallback } from 'react';
import { FaLocationDot, FaPlus } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";
import { FiShoppingCart } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { TbReceipt2 } from "react-icons/tb";
import { useSelector, useDispatch } from 'react-redux';
import { setSearchItems, setUserData } from '../redux/userSlice';
import axios from 'axios';
import { serverUrl } from '../App';
import ClipLoader from "react-spinners/ClipLoader";
import { useNavigate } from 'react-router-dom';
import { resetOwner } from "../redux/ownerSlice";
import { resetUser } from "../redux/userSlice";

const Navbar = () => {
  const { userData, currentCity, currentState, cartItems } = useSelector((state) => state.user);
  const { myShopData } = useSelector((state) => state.owner);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPopup, setShowPopup] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  // 🔹 Logout function
  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true });
      dispatch(setUserData(null));
      dispatch(resetOwner());
      dispatch(resetUser()); 

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Search function (memoized)
  const handleSearchItems = useCallback(async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/item/search-items?query=${query}&state=${currentState}`,
        { withCredentials: true }
      );
      dispatch(setSearchItems(result.data))

    } catch (error) {
      console.log("Search error:", error);
    }
  }, [query, currentState]);

  // 🔹 Debounce effect for search
  useEffect(() => {
    if (query) {
      handleSearchItems()
    } else {
      dispatch(setSearchItems(null))
    }
  }, [query, handleSearchItems]);

  return (
    <div className="max-w-6xl w-full h-[70px] flex items-center justify-between md:justify-center gap-[30px] lg:px-0 px-[20px] fixed top-0 z-[9999] bg-[#fff9f6]">

      {/* Mobile Search Bar */}
      {showSearch && userData?.role === "user" && (
        <div className="w-[90%] border shadow-md border-gray-300 h-[60px] md:hidden bg-white rounded-lg items-center gap-[20px] flex fixed top-[70px] left-1/2 -translate-x-1/2">
          <div className="flex items-center w-[30%] gap-[10px] px-[10px] border-r-[2px] border-gray-400">
            <FaLocationDot size={25} className="text-[#ff4d2d]" />
            <div className="truncate text-gray-600">{currentCity}</div>
          </div>

          <div className="w-[80%] flex items-center gap-[10px]">
            <IoSearch size={25} className="text-[#ff4d2d]" />
            <input
              className="px-[10px] text-gray-700 outline-0 w-full"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search delicious food..."
            />
          </div>
        </div>
      )}

      {/* Logo */}
      <h1 className="text-3xl font-bold mb-2 text-[#ff4d2d] cursor-pointer" onClick={() => navigate("/")}>
        {/* Taza<span className='text-[#ff8a00]'>Bite</span> */}

        <h1
          className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d2d] to-orange-400 tracking-wide hover:scale-105 transition-transform duration-300  animate-pulse drop-shadow-[0_0_0px_#ff4d2d]"
        >
          TazaBite
        </h1>




      </h1>

      {/* Desktop Search */}
      {userData?.role === "user" && (
        <div className="md:w-[80%] lg:w-[60%] h-[60px] bg-white border shadow-md border-gray-300 rounded-lg items-center gap-[20px] hidden md:flex">
          <div className="flex items-center w-[30%] gap-[10px] px-[10px] border-r-[2px] border-gray-400">
            <FaLocationDot size={25} className="text-[#ff4d2d]" />
            <div className="truncate text-gray-600">{currentCity}</div>
          </div>

          <div className="w-[80%] flex items-center gap-[10px]">
            <IoSearch size={25} className="text-[#ff4d2d]" />
            <input
              onChange={(e) => setQuery(e.target.value)}
              value={query}
              className="px-[10px] text-gray-700 outline-0 w-full"
              type="text"
              placeholder="search delicious food..."
            />
          </div>
        </div>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-4 relative">
        {/* Mobile Search Toggle */}
        {userData?.role === "user" && (
          showSearch ? (
            <RxCross2
              onClick={() => setShowSearch(false)}
              size={25}
              className="text-[#ff4d2d] md:hidden cursor-pointer"
            />
          ) : (
            <IoSearch
              onClick={() => setShowSearch(true)}
              size={25}
              className="text-[#ff4d2d] md:hidden cursor-pointer"
            />
          )
        )}

        {/* Add Food Button for Shop Owners */}
        {userData?.role === "owner" && myShopData && (
          <>
            <button
              onClick={() => navigate("/add-item")}
              className="hidden md:flex items-center px-3 py-2 gap-2 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d]"
            >
              <FaPlus size={15} />
              <span className="text-sm font-medium">Add Food Item</span>
            </button>

            <button
              onClick={() => navigate("/add-item")}
              className="md:hidden px-3 py-2 rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]"
            >
              <FaPlus size={15} />
            </button>
          </>
        )}

        {/* Cart for User */}
        {userData?.role === "user" && (
          <div onClick={() => navigate("/cart")} className="relative cursor-pointer">
            <FiShoppingCart size={25} className="text-[#ff4d2d]" />
            <span className="absolute right-[-9px] top-[-12px] text-[#ff4d2d] font-bold">
              {cartItems?.length || 0}
            </span>
          </div>
        )}

        {/* My Orders */}
        {userData && (
          userData.role === "user" ? (
            <button
              onClick={() => navigate("/my-orders")}
              className="hidden md:block px-3 py-2 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium"
            >
              My Order
            </button>
          ) : (
            <div>
              <button
                onClick={() => navigate("/my-orders")}
                className="hidden md:flex px-3 py-2 relative items-center gap-2 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium"
              >
                <TbReceipt2 size={20} />
                <span>My Order</span>
              </button>

              <button
                onClick={() => navigate("/my-orders")}
                className="md:hidden flex px-3 py-2 relative rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]"
              >
                <TbReceipt2 size={20} />
                <span className="absolute -right-2 -top-2 text-xs font-bold text-white bg-[#ff4d2d] rounded-full px-[6px] py-[1px]">0</span>
              </button>
            </div>
          )
        )}

        {/* Avatar & Popup */}
        <div
          onClick={() => setShowPopup((prev) => !prev)}
          className="w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-[14px] shadow-xl font-semibold cursor-pointer relative"
        >
          {userData?.fullName?.[0]?.toUpperCase() || "?"}

          {showPopup && (
            <div className="absolute top-[110%] right-0 w-[160px] bg-white shadow-2xl rounded-xl p-[12px] flex flex-col gap-[6px] z-[9999] animate-fadeIn">
              <div className="text-[14px] font-semibold text-gray-700">
                {userData?.fullName}
              </div>
              {userData?.role === "user" && (
                <div
                  onClick={() => navigate("/my-orders")}
                  className="text-[14px] font-semibold text-[#ff4d2d] cursor-pointer md:hidden"
                >
                  My Orders
                </div>
              )}
              <div
                onClick={handleLogout}
                className="text-[#ff4d2d] font-semibold cursor-pointer text-[14px]"
              >
                {loading ? <ClipLoader size={20} color="#ff4d2d" /> : "Log Out"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
