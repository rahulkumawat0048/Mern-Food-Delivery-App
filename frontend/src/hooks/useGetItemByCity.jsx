import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setItemsInMyCity } from "../redux/userSlice";
import { serverUrl } from "../App";

function useGetItemByCity() {
  const dispatch = useDispatch();
  const { currentCity,currentState } = useSelector((state) => state.user);

  useEffect(() => {

    const fetchShopByCity = async () => {
          if (!currentState) return; // skip fetch if city is not ready yet

      try {
        const result = await axios.get(
          `${serverUrl}/api/item/get-by-city/${currentState}`,
          {
            withCredentials: true,
          }
        );
        dispatch(setItemsInMyCity(result.data));
        console.log(result.data)
      } catch (error) {
        console.error("Failed to fetch items by city:", error);
      }
    };

    fetchShopByCity();
  }, [currentState, dispatch]);

  return null;
}

export default useGetItemByCity;
