import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { serverUrl } from "../App";
import axios from "axios";
import { setMyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners"



const EditItem = () => {
    const navigate = useNavigate();
    const { myShopData } = useSelector((state) => state.owner);
    const { itemId } = useParams()
    const [currentItem, setcurrentItem] = useState("");


    const [name, setName] = useState("");
    const [price, setprice] = useState(0);
    const [frontendImage, setFrontendImage] = useState("");
    const [backendImage, setBackendImage] = useState(null);
    const [category, setcategory] = useState("");
    const [foodType, setfoodType] = useState("");
    const categories = [
        "Snacks",
        "Main Course",
        "Desserts",
        "Pizza",
        "Burgers",
        "Sandwiches",
        "South Indian",
        "North Indian",
        "Chinese",
        "Fast Food",
        "Others",
    ]

    const dispatch = useDispatch()
    const [loading, setloading] = useState(false);

    const handleImage = (e) => {
        const file = e.target.files[0]
        console.log(file)
        setBackendImage(file)
        setFrontendImage(URL.createObjectURL(file))
    }

    const handleSubmit = async (e) => {
        console.log(`itemId=${itemId}`)
        e.preventDefault();
        setloading(true);
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("category", category);
            formData.append("foodType", foodType);
            formData.append("price", price);
            if (backendImage) {
                formData.append("image", backendImage);
            }

            // ✅ include itemId in the URL
            const result = await axios.post(
                `${serverUrl}/api/item/edit-item/${itemId}`,
                formData,
                { withCredentials: true }
            );

            console.log(result.data);
            dispatch(setMyShopData(result.data));
            navigate("/")
        } catch (error) {
            console.log("Edit item error:", error);
        } finally {
            setloading(false);
        }
    };


    useEffect(() => {

        const handleGetItemById = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/item/get-by-id/${itemId}`, { withCredentials: true })

                setcurrentItem(result.data)

            } catch (error) {
                console.log(error)
            }
        }
        handleGetItemById()
    }, [itemId]);

    useEffect(() => {
        setName(currentItem?.name || "")
        setprice(currentItem?.price || "")
        setcategory(currentItem?.category || "")
        setFrontendImage(currentItem?.image || "")
        setfoodType(currentItem?.foodType || "")
    }, [currentItem]);

    return (
        <div className="flex justify-center flex-col items-center p-6 bg-gradient-to-br from-orange-50 relative to-white min-h-screen">
            {/* back button */}
            <div
                onClick={() => navigate("/")}
                className="absolute top-[20px] left-[20px] z-[10] mb-[10px] cursor-pointer"
            >
                <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
            </div>

            {/* form */}
            <div className="max-w-lg w-full bg-white shadow-md rounded-2xl p-8 border-gray-200 border">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-orange-100 p-4 rounded-full mb-2">
                        <FaUtensils className="text-[#ff4d2d] w-12 h-12" />
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900">
                        Edit Food
                    </div>
                </div>

                <form className="space-y-5"
                    onSubmit={handleSubmit}
                >
                    {/* name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            type="text"
                            placeholder="Enter Food Name"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-orange-500 focus:ring-[0.5px]"
                        />
                    </div>

                    {/* price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                        <input
                            onChange={(e) => setprice(e.target.value)}
                            value={price}
                            type="number"
                            placeholder="0"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-orange-500 focus:ring-[0.5px]"
                        />
                    </div>

                    {/* select category  */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Category</label>
                        <select
                            onChange={(e) => setcategory(e.target.value)}
                            value={category}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-orange-500 focus:ring-[0.5px]"
                        >
                            <option value="">select category</option>
                            {
                                categories.map((cate, index) => (
                                    <option value={cate} key={index}>{cate}</option>
                                ))
                            }
                        </select>

                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Food Type</label>
                        <select
                            onChange={(e) => setfoodType(e.target.value)}
                            value={foodType}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-orange-500 focus:ring-[0.5px]"
                        >
                            <option value="veg">veg</option>
                            <option value="non veg">non veg</option>

                        </select>

                    </div>

                    {/* image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Food Image</label>
                        <input
                            onChange={handleImage}
                            type="file"
                            accept="image/*"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-orange-500 focus:ring-[0.5px]"
                        />
                    </div>

                    {/* show image in ui */}

                    {
                        frontendImage &&
                        (<div>
                            <img src={frontendImage} alt="" className="w-full h-48 object-cover rounded-lg border   " />
                        </div>)
                    }



                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200 cursor-pointer focus:outline-none"
                    >
                        {loading ? <ClipLoader size={20} color="white" /> : "Save"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditItem;
