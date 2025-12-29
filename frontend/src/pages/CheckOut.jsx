import React, { useEffect, useState } from 'react';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { IoLocationSharp, IoSearchOutline } from 'react-icons/io5';
import { TbCurrentLocation } from 'react-icons/tb';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import "leaflet/dist/leaflet.css";
import { setAddress, setLocation } from '../redux/mapSlice';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { MdDeliveryDining } from "react-icons/md"
import { FaMobileScreenButton } from 'react-icons/fa6';
import { FaCreditCard } from 'react-icons/fa';
import { serverUrl } from '../App';
import { addMyOrder } from '../redux/userSlice';
import { showToast } from '../utils/showToast';

function RecenterMap({ location }) {
    const map = useMap();
    if (location?.lat && location?.lon) {
        map.setView([location.lat, location.lon], 16, { animate: true });
    }
    return null;
}

function MarkerWithDrag({ location, getAddressByLatLng }) {
    const dispatch = useDispatch();
    const map = useMap();

    const onDragEnd = (e) => {
        const { lat, lng } = e.target._latlng;
        dispatch(setLocation({ lat, lon: lng }));
        map.setView([lat, lng], 16, { animate: true });
        getAddressByLatLng(lat, lng);
    };

    return (
        <Marker
            position={[location?.lat || 20.5937, location?.lon || 78.9629]}
            draggable
            eventHandlers={{ dragend: onDragEnd }}
        />
    );
}

const CheckOut = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { location, address } = useSelector(state => state.map);
    const apiKey = import.meta.env.VITE_GEOAPIKEY;
    const [loading, setLoading] = useState(false);
    const [addressInput, setAddressInput] = useState("");
    const [paymentMethod, setpaymentMethod] = useState("cod");
    const { cartItems, userData } = useSelector(state => state.user);
    const [buttonLoading, setbuttonLoading] = useState(false);


    const { totalAmount } = useSelector(state => state.user);
    const deliveryFee = totalAmount > 500 ? 0 : 40;
    const amountWithDeliveryFee = deliveryFee + totalAmount



    const getAddressByLatLng = async (lat, lng) => {
        try {
            const response = await axios.get(
                `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`
            );
            const place = response?.data?.results?.[0];
            const fetchedAddress = place?.formatted || "";
            dispatch(setAddress(fetchedAddress));
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentLocation = () => {
        setLoading(true);
        const latitude = userData.location.coordinates[1]
        const longitude = userData.location.coordinates[0]
        dispatch(setLocation({ lat: latitude, lon: longitude }));
        getAddressByLatLng(latitude, longitude);

    };

    const getLatLngByAddress = async () => {
        if (!addressInput.trim()) return;
        try {
            const result = await axios.get(
                `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&format=json&apiKey=${apiKey}`
            );
            const place = result?.data?.results?.[0];
            if (place) {
                dispatch(setLocation({ lat: place.lat, lon: place.lon }));
                dispatch(setAddress(place.formatted));
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handlePlaceOrder = async () => {
        if (paymentMethod === "online") {
            showToast("Online payment is currently unavailable. Please use Cash on Delivery (COD).");
            return
        }
        setbuttonLoading(true)
        try {
            const result = await axios.post(
                `${serverUrl}/api/order/place-order`,
                {
                    paymentMethod,
                    deliveryAddress: {
                        text: addressInput,
                        latitude: location.lat,
                        longitude: location.lon
                    },
                    totalAmount,
                    cartItems
                },
                { withCredentials: true, }
            );
            console.log(result.data)
            dispatch(addMyOrder(result.data))
            navigate("/order-placed")
            setbuttonLoading(false)
        } catch (error) {
            console.log("handle place order error", error)
        } finally {
            setbuttonLoading(false)
        }
    }

    useEffect(() => {
        setAddressInput(address || "");
    }, [address]);

    return (
        <div className='min-h-screen bg-[#fff9f6] flex items-center justify-center p-6'>
            <div
                className="absolute top-[20px] left-[20px] z-[10] cursor-pointer"
                onClick={() => navigate("/cart")}
            >
                <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
            </div>

            <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-xl p-6 space-y-6">
                {/* page name  */}
                <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>

                {/* map section  */}
                <section>
                    <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800">
                        <IoLocationSharp className="text-[#ff4d2d]" />
                        Delivery Location
                    </h2>

                    <div className="flex gap-2 mb-3">
                        <input
                            onChange={(e) => setAddressInput(e.target.value)}
                            value={addressInput}
                            type="text"
                            className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff4d2d]"
                            placeholder="Enter Your Delivery Address.."
                        />

                        <button
                            onClick={getLatLngByAddress}
                            className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-3 py-2 rounded-lg flex items-center justify-center"
                        >
                            <IoSearchOutline size={17} />
                        </button>

                        <button
                            onClick={getCurrentLocation}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center"
                        >
                            {!loading ? <TbCurrentLocation size={17} /> : <ClipLoader size={17} color='white' />}
                        </button>
                    </div>

                    <div className="rounded-xl border overflow-hidden h-64 w-full">
                        <MapContainer
                            zoom={13}
                            scrollWheelZoom={false}
                            className="w-full h-full"
                            center={[location?.lat || 20.5937, location?.lon || 78.9629]}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            <RecenterMap location={location} />
                            <MarkerWithDrag location={location} getAddressByLatLng={getAddressByLatLng} />
                        </MapContainer>
                    </div>
                </section>

                {/* payment method section  */}

                <section>
                    <h2 className="text-lg font-semibold mb-3 text-gray-800 ">Payment Method</h2>
                    {/* buttons  */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div
                            onClick={() => setpaymentMethod("cod")}
                            className={`cursor-pointer flex items-center gap-3 rounded-xl border p-4 text-left transition ${paymentMethod == "cod" ? "border-[#ff4d2d] bg-orange-50 shadow" : "border-gray-200 hover:border-gray-300"
                                }`}>
                            <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100'> <MdDeliveryDining className='text-green-600 text-xl' /></span>
                            <div>
                                <p className="font-medium text-gray-800">Cash On Delivery</p>
                                <p className="text-xs text-gray-500">Pay when your food arrives</p>
                            </div>
                        </div>

                        <div
                            onClick={() => setpaymentMethod("online")}
                            className={`cursor-pointer flex items-center gap-3 rounded-xl border p-4 text-left transition ${paymentMethod == "online" ? "border-[#ff4d2d] bg-orange-50 shadow" : "border-gray-200 hover:border-gray-300"
                                }`}>
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100"><FaMobileScreenButton className='text-purple-700 text-lg' /></span>
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100"><FaCreditCard className='text-blue-700 text-lg' /></span>
                            <div>
                                <p className='font-medium text-gray-800'>UPI / Credit Debit Card</p>
                                <p className='text-xs text-gray-500'>Pay Securely Online</p>
                            </div>
                        </div>

                    </div>
                </section>

                {/* order summary  */}
                <section>
                    {/* heading  */}
                    <h2 className="text-lg font-semibold mb-3 text-gray-800 ">Order Summary</h2>
                    <div className="rounded-xl border bg-gray-50 p-4 space-y-2">
                        {
                            cartItems.map((item, index) => (
                                <div key={index} className='flex justify-between text-sm text-gray-700'>
                                    <span>{item.name} x {item.quantity}</span>
                                    <span>₹ {item.price * item.quantity} </span>
                                </div>
                            ))
                        }
                        <hr className='border-gray-200 my-2' />

                        <div className="flex justify-between font-medium text-gray-800 ">
                            <span>Subtotal</span>
                            <span>₹ {totalAmount}</span>
                        </div>
                        <div className="flex justify-between font-medium text-gray-700 ">
                            <span>Delivery Fee</span>
                            <span>{deliveryFee == 0 ? "Free" : `₹ ${deliveryFee}`}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-[#ff4d2d] pt-2">
                            <span>Total</span>
                            <span>₹ {amountWithDeliveryFee}</span>
                        </div>

                    </div>

                </section>

                {/* button for place order or checkout payment page  */}
                <button
                    disabled={buttonLoading}
                    onClick={handlePlaceOrder}
                    className='w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white py-3 rounded-xl font-semibold text-lg'>
                    {buttonLoading ? (
                        <ClipLoader color="#ffffff" size={24} />
                    ) : (
                        <>
                            {paymentMethod === "cod" ? "Place Order" : "Pay & Place Order"}
                        </>
                    )}
                </button>



            </div>
        </div>
    );
};

export default CheckOut;
