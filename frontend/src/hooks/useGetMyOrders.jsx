import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setMyOrders } from "../redux/userSlice";
import { serverUrl } from "../App";

function useGetMyOrders() {
  const dispatch = useDispatch();
  const {myOrders}=useSelector(state=>state.user)


  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/order/my-orders`, {
          withCredentials: true,
        });

        if (isMounted) {
          dispatch(setMyOrders(result.data));
          console.log(result.data);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching orders:", err);
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false; 
    };
  }, [dispatch ,]);

  return null; // custom hooks don’t render anything
}

export default useGetMyOrders;
