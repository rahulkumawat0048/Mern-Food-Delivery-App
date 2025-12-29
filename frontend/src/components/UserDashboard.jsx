import React, { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar.jsx";
import { categories } from "../category.js";
import CategoryCard from "./CategoryCard.jsx";
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import FoodCard from "./FoodCard.jsx";
import useGetShopByCity from "../hooks/useGetShopByCity.jsx";
import useGetItemByCity from "../hooks/useGetItemByCity.jsx";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const UserDashboard = () => {
  const cateScrollRef = useRef();
  const shopScrollRef = useRef();

  const [showRightCateButton, setShowRightCateButton] = useState(false);
  const [showLeftCateButton, setShowLeftCateButton] = useState(false);
  const [showRightShopButton, setShowRightShopButton] = useState(false);
  const [showLeftShopButton, setShowLeftShopButton] = useState(false);

  const { shopsInMyCity, itemsInMyCity, searchItems } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const getShops = useGetShopByCity();
  const getItems = useGetItemByCity();

  const handleFilterByCategory = (category) => {
    navigate(`/category/${category}`);
  };

  useEffect(() => {
    if (shopsInMyCity === null) getShops;
    if (itemsInMyCity === null) getItems;
  }, [shopsInMyCity, itemsInMyCity]);

  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current;
    if (element) {
      setLeftButton(element.scrollLeft > 0);
      setRightButton(element.scrollLeft + element.clientWidth < element.scrollWidth);
    }
  };

  useEffect(() => {
    const cateEl = cateScrollRef.current;
    const shopEl = shopScrollRef.current;
    if (!cateEl || !shopEl) return;

    updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton);
    updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton);

    const cateScrollHandler = () => updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton);
    const shopScrollHandler = () => updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton);

    cateEl.addEventListener("scroll", cateScrollHandler);
    shopEl.addEventListener("scroll", shopScrollHandler);

    return () => {
      cateEl.removeEventListener("scroll", cateScrollHandler);
      shopEl.removeEventListener("scroll", shopScrollHandler);
    };
  }, [shopsInMyCity]);

  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  return (
    shopsInMyCity && itemsInMyCity ? (
      <div className="w-screen min-h-screen bg-[#fff9f6] flex flex-col items-center gap-5 overflow-y-auto">
        <Navbar />

        {/* 🔍 Search Results */}
        {searchItems && searchItems.length > 0 && (
          <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-5 bg-white shadow-sm rounded-2xl mt-4">
            <h1 className="text-gray-900 text-xl sm:text-2xl font-semibold border-b border-gray-200 pb-2">
              Search Results
            </h1>
            <div className="w-full h-auto flex flex-wrap gap-6 justify-center">
              {searchItems.map((item) => (
                <FoodCard data={item} key={item._id} />
              ))}
            </div>
          </div>
        )}

        {/* 🧭 Category Section */}
        <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
          <h1 className="text-gray-800 text-xl font-serif">Inspiration for your first order</h1>
          <div className="w-full relative">
            {showLeftCateButton && (
              <div
                onClick={() => scrollHandler(cateScrollRef, "left")}
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10 cursor-pointer"
              >
                <FaCircleChevronLeft />
              </div>
            )}

            <div ref={cateScrollRef} className="w-full flex overflow-x-auto gap-4 pb-2">
              {categories.map((cate, index) => (
                <CategoryCard
                  onClick={() => handleFilterByCategory(cate.category)}
                  name={cate.category}
                  image={cate.image}
                  key={index}
                />
              ))}
            </div>

            {showRightCateButton && (
              <div
                onClick={() => scrollHandler(cateScrollRef, "right")}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10 cursor-pointer"
              >
                <FaCircleChevronRight />
              </div>
            )}
          </div>
        </div>

        {/* 🏪 Shops Section */}
        <div className="w-full max-w-6xl flex flex-col gap-5 items-start px-[10px]">
          <h1 className="text-gray-800 text-xl font-serif">Best shops in your city</h1>
          <div className="w-full relative">
            {showLeftShopButton && (
              <div
                onClick={() => scrollHandler(shopScrollRef, "left")}
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10 cursor-pointer"
              >
                <FaCircleChevronLeft />
              </div>
            )}

            <div ref={shopScrollRef} className="w-full flex overflow-x-auto gap-4 pb-2">
              {shopsInMyCity?.map((shop, index) => (
                <CategoryCard
                  name={shop.name}
                  image={shop.image}
                  key={index}
                  onClick={() => navigate(`shop/${shop._id}`)}
                />
              ))}
            </div>

            {shopsInMyCity == null && (
              <div className="items-center justify-center flex h-[120px] md:h-[180px] rounded-2xl">
                <ClipLoader color="#ff4d2d" className="font-extrabold" />
              </div>
            )}

            {showRightShopButton && (
              <div
                onClick={() => scrollHandler(shopScrollRef, "right")}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10 cursor-pointer"
              >
                <FaCircleChevronRight />
              </div>
            )}
          </div>
        </div>

        {/* 🍔 Suggested Food Items */}
        <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
          <h1 className="text-gray-800 text-xl font-serif">Suggested Food Items</h1>
          <div className="w-full h-auto flex flex-wrap gap-[20px] justify-center">
            {itemsInMyCity?.map((item, index) => (
              <FoodCard data={item} key={index} />
            ))}
          </div>
          {itemsInMyCity == null && (
            <div className="items-center w-full justify-center flex h-[200px] md:h-[280px] rounded-2xl">
              <ClipLoader color="#ff4d2d" className="font-extrabold" />
            </div>
          )}
        </div>

        <div className="h-16"></div>
      </div>
    ) : (
      <div className="h-screen w-full top-0 absolute flex justify-center items-center bg-white">
        <img src={logo} alt="TazaBite Loading" className="w-24 h-24 animate-bounce rounded-xl" />
      </div>
    )
  );
};

export default UserDashboard;
