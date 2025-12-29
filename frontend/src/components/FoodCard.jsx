import { React, useState } from 'react';
import { FaLeaf, FaDrumstickBite, FaStar, FaRegStar, FaMinus, FaPlus } from 'react-icons/fa6';
import { FaShoppingCart } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/userSlice';
import Toast from './Toast';

const FoodCard = ({ data }) => {
    const dispatch = useDispatch();
    const { cartItems } = useSelector(state => state.user);
    const [quantity, setQuantity] = useState(1);
    const [toastList, setToastList] = useState([]);

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(i <= rating ? <FaStar key={i} className='text-yellow-500 text-lg' /> : <FaRegStar key={i} className='text-yellow-500 text-lg' />);
        }
        return stars;
    };

    const handleIncrease = () => setQuantity(quantity + 1);

    const handleDecrease = () => {
        if (quantity <= 1) {
            setToastList([...toastList, { id: Date.now(), message: "Quantity cannot be less than 1" }]);
            return;
        }
        setQuantity(1);
    };

    const handleAddToCart = () => {
        if (quantity === 0) {
            setToastList([...toastList, { id: Date.now(), message: "Quantity must be at least 1" }]);
            return;
        }

        dispatch(addToCart({
            id: data._id,
            name: data.name,
            price: data.price,
            image: data.image,
            shop: data.shop,
            quantity: quantity,
            foodType: data.foodType
        }));

        setToastList([...toastList, { id: Date.now(), message: `${data.name} added to cart` }]);
        setQuantity(1);
    };

    const removeToast = (id) => {
        setToastList(prev => prev.filter(t => t.id !== id));
    };

    return (
        <>
            <div className='w-[250px] rounded-2xl border border-[#ff4d2d] bg-white shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col'>
                
                {/* Image */}
                <div className="relative w-full h-[170px] flex justify-center items-center bg-white">
                    <div className='absolute top-3 right-3 bg-white rounded-full p-1 shadow'>
                        {data.foodType === "veg" ? <FaLeaf className='text-green-600 text-lg' /> : <FaDrumstickBite className='text-red-600 text-lg' />}
                    </div>
                    <img src={data.image} alt="" className='w-full h-full object-cover transition-transform duration-300 hover:scale-105' />
                </div>

                <div className="flex-1 flex flex-col px-4 pt-2 pb-4">
                    <h1 className="font-semibold text-gray-900 text-base truncate">{data.name}</h1>
                    <div className="flex items-center gap-1 mt-1">
                        {renderStars(data.rating.average || 0)}
                        <span className="text-xs text-gray-500">({data.rating?.count || 0})</span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3">
                        <span className="font-bold text-gray-900 text-lg">₹ {data.price}</span>

                        <div className="flex items-center gap-2 border rounded-full overflow-hidden shadow-sm">
                            <button onClick={handleDecrease} className="px-2 py-1 hover:bg-gray-100"><FaMinus size={12} /></button>
                            <span>{quantity}</span>
                            <button onClick={handleIncrease} className="px-2 py-1 hover:bg-gray-100"><FaPlus size={12} /></button>

                            <button
                                onClick={handleAddToCart}
                                className={`${cartItems.some(i => i.id === data._id) ? "bg-gray-800" : "bg-[#ff4d2d]"} text-white px-3 py-2 transition-colors`}
                            >
                                <FaShoppingCart size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toasts */}
            {toastList.map(toast => (
                <Toast key={toast.id} message={toast.message} onClose={() => removeToast(toast.id)} />
            ))}
        </>
    );
};

export default FoodCard;
