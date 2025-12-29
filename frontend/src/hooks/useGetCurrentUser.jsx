import { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const useGetCurrentUser = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Prevents state update after unmount

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${serverUrl}/api/user/current`, {
          withCredentials: true,
        });

        if (isMounted && response.data) {
          dispatch(setUserData(response.data));

        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching current user:", err.message);
          setError(err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      isMounted = false; // cleanup on unmount
    };
  }, [dispatch]);

  return { loading, error };
};

export default useGetCurrentUser;
