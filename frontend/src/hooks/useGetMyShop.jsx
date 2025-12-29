import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setMyShopData, setLoading, setError } from "../redux/ownerSlice";
import { serverUrl } from "../App";

export default function useGetMyShop() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (!userData?._id) return;

    const controller = new AbortController();

    const fetchShop = async () => {
      dispatch(setLoading(true));

      try {
        const result = await axios.get(`${serverUrl}/api/shop/get-my`, {
          withCredentials: true,
          signal: controller.signal,
        });

        dispatch(setMyShopData(result.data));
      } catch (err) {
        if (err.name !== "CanceledError") {
          dispatch(setError(err.message));
        }
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchShop();

    return () => controller.abort();
  }, [userData?._id, dispatch]);
}
