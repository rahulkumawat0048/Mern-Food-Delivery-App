import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setShopsInMyCity } from "../redux/userSlice";
import { serverUrl } from "../App";

function useGetShopByCity() {
  const dispatch = useDispatch();
  const { currentCity,currentState } = useSelector((state) => state.user);

  useEffect(() => {

    const fetchShopByCity = async () => {
          if (!currentCity) return; // skip fetch if city is not ready yet

      try {
        const result = await axios.get(
          `${serverUrl}/api/shop/get-by-city/${currentState}`,
          {
            withCredentials: true,
          }
        );
        dispatch(setShopsInMyCity(result.data));
      } catch (error) {
        console.error("Failed to fetch shops by city:", error);
      }
    };

    fetchShopByCity();
  }, [currentCity, dispatch]);

  return null;
}

export default useGetShopByCity;
