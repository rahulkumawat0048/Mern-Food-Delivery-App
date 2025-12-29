import React from 'react';
import axios from 'axios';
import { FaPen } from 'react-icons/fa';
import { FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setMyShopData } from '../redux/ownerSlice';


const OwnerItemCard = ({ data }) => {
    const navigate=useNavigate()
    const dispatch=useDispatch()


const handleDeleteItem = async () => {
  try {
    const result = await axios.post(
      `${serverUrl}/api/item/delete/${data._id}`,
      {}, 
      { withCredentials: true }
    );

    console.log(result.data);
    dispatch(setMyShopData(result.data));
  } catch (error) {
    console.log(error);
  }
};

    return (
        <div className='flex h-[124px] bg-white rounded-lg shadow-md overflow-hidden  w-full max-w-2xl hover:shadow-xl transition-all duration-300  border border-gray-300   '>
            <div className='w-36 h-full flex-shrink-0 bg-gray-50'>
                <img src={data.image} alt="" className='w-full h-full object-cover' />
            </div>
            <div className='flex flex-col justify-between flex-1 px-4 py-1.5 '>
                <div >
                    <h2 className='text-lg font-bold text-[#ff4d2d] truncate'>{data.name}</h2>
                    <p >
                        <span className="font-semibold  text-[15px] text-gray-700">Category: </span  >
                        <span className="text-gray-600 text-[14px] font-semibold">{data.category}</span>
                    </p>
                    <p>
                        <span className="font-semibold text-[15px] text-gray-700">Food Type: </span >
                        <span className="text-gray-600 text-[14px] font-semibold">{data.foodType}</span>
                    </p>
                </div>
                <div className="flex items-center justify-between">
                    <div className='text-[#ff4d2d] font-semibold'><span className="text-black font-bold">Price :</span> {data.price} <span className="">Rs</span></div>
                    <div className='flex gap-2 text-[#ff4d2d]'>
                        <div
                         onClick={()=>navigate(`/edit-item/${data._id}`)}
                         className='cursor-pointer rounded-full items-center p-2  hover:bg-[#ff4d2d]/10'><FaPen size={16}/></div>
                        <div
                        onClick={handleDeleteItem}
                         className="cursor-pointer rounded-full items-center p-2  hover:bg-[#ff4d2d]/10"><FaTrashAlt size={16}/></div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default OwnerItemCard;
