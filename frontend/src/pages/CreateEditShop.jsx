import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { serverUrl } from "../App";
import axios from "axios";
import { setMyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners"



const CreateEditShop = () => {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);
  const { currentCity, currentAddress, currentState } = useSelector((state) => state.user);

  const [name, setName] = useState(myShopData?.name || "");
  const [address, setAddress] = useState(myShopData?.address || currentAddress || "");
  const [city, setCity] = useState(myShopData?.city || currentCity || "");
  const [state, setState] = useState(myShopData?.state || currentState || "");
  const [frontendImage, setFrontendImage] = useState(myShopData?.image || null);
  const [backendImage, setBackendImage] = useState(null);
  const dispatch = useDispatch()
  const [loading, setloading] = useState(false);


  useEffect(() => {
    if (!myShopData) {
      setCity(currentCity || "");
      setState(currentState || "");
      setAddress(currentAddress || "");
    }
  }, [currentCity, currentState, currentAddress, myShopData]);

  const handleImage = (e) => {
    const file = e.target.files[0]
    console.log(file)
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    setloading(true)
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("city", city)
      formData.append("state", state)
      formData.append("address", address)
      if (backendImage) {
        formData.append("image", backendImage)
      }

      const result = await axios.post(`${serverUrl}/api/shop/create-edit`, formData, {
        withCredentials: true,
      });

      console.log(result.data)
      dispatch(setMyShopData(result.data))


    } catch (error) {
      console.log(error)
    } finally {
      setloading(false)
    }
  }

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
            {myShopData ? "Edit Shop" : "Add Shop"}
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              placeholder="Enter Shop Name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-orange-500 focus:ring-[0.5px]"
            />
          </div>

          {/* image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Image</label>
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


          {/* state and city */}
          <div className="md:flex md:gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                onChange={(e) => setCity(e.target.value)}
                value={city || ""}
                type="text"
                placeholder="City"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-orange-500 focus:ring-[0.5px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                onChange={(e) => setState(e.target.value)}
                value={state || ""}
                type="text"
                placeholder="State"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-orange-500 focus:ring-[0.5px]"
              />
            </div>
          </div>

          {/* address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              onChange={(e) => setAddress(e.target.value)}
              value={address || ""}
              type="text"
              placeholder="Enter Shop Address"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-orange-500 focus:ring-[0.5px]"
            />
          </div>

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

export default CreateEditShop;
