import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Navbar from '../components/Navbar.jsx'
import FoodCard from '../components/FoodCard.jsx'
import { ClipLoader } from 'react-spinners'
import { IoIosArrowRoundBack } from 'react-icons/io'

const CategoryItems = () => {
    const { category } = useParams()
    const { itemsInMyCity } = useSelector((state) => state.user)
    const [filteredItems, setFilteredItems] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        if (itemsInMyCity && category) {
            if (category === "All") {
                setFilteredItems(itemsInMyCity)
            } else {
                const filtered = itemsInMyCity.filter(item => item.category === category)
                setFilteredItems(filtered)
            }
        }
    }, [itemsInMyCity, category])

    return (
        <div className="w-screen min-h-screen bg-[#fff9f6] flex flex-col items-center gap-5 overflow-y-auto">
            

            <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-5 bg-white shadow-sm rounded-2xl mt-4">

                <div className="flex gap-4">
                    <div
                onClick={() => navigate("/")}
                className="cursor-pointer"
            >
                <IoIosArrowRoundBack size={35} className="text-[#ff4d2d] font-bold" />
            </div>
                    <h1 className="text-gray-900 text-2xl font-semibold border-b border-gray-200 pb-2">
                    {category === "All" ? "All Food Items" : `${category} Items`}
                </h1>
                </div>

                {itemsInMyCity == null ? (
                    <div className="items-center w-full justify-center flex h-[200px] md:h-[280px] rounded-2xl">
                        <ClipLoader color="#ff4d2d" />
                    </div>
                ) : filteredItems.length > 0 ? (
                    <div className="w-full h-auto flex flex-wrap gap-6 justify-center">
                        {filteredItems.map((item) => (
                            <FoodCard data={item} key={item._id} />
                        ))}
                    </div>
                ) : (
                    <h1 className="text-gray-600 mt-4">No food available for this category.</h1>
                )}
            </div>
            <div className="h-16"></div>
        </div>
    )
}

export default CategoryItems
