import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setCurrentCity, setCurrentState, setCurrentAddress } from "../redux/userSlice";
import { setAddress, setLocation } from "../redux/mapSlice";

// Simplified All-India districts list with approximate coordinates (lat, lon center of district)
const districts = [
  { name: "Rajsamand", lat: 25.0685, lon: 73.8591 },
  { name: "Udaipur", lat: 24.5854, lon: 73.7125 },
  { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { name: "Bhilwara", lat: 25.3466, lon: 74.6359 },
  { name: "Kota", lat: 25.2138, lon: 75.8648 },
  // ... add all ~740 districts of India with center lat/lon
];

// Function to calculate distance between two coords (Haversine)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // km
};

// Find nearest district from coordinates
const getNearestDistrict = (lat, lon) => {
  let nearest = districts[0];
  let minDist = getDistance(lat, lon, nearest.lat, nearest.lon);

  for (let i = 1; i < districts.length; i++) {
    const d = getDistance(lat, lon, districts[i].lat, districts[i].lon);
    if (d < minDist) {
      minDist = d;
      nearest = districts[i];
    }
  }
  return nearest.name;
};

function useGetCity() {
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  useEffect(() => {
    let isMounted = true;

    const fetchCity = async (latitude, longitude) => {
      try {
        const response = await axios.get(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
        );

        const place = response?.data?.results?.[0];

        // Extract Geoapify district
        const geoDistrict =
          place?.state_district ||
          place?.county ||
          place?.district ||
          "";

        const stateName = place?.state || "Unknown";
        const address = place?.formatted || "";

        // Coordinates based nearest district check
        const nearestDistrict = getNearestDistrict(latitude, longitude);

        // If Geoapify district is missing / obviously wrong, use nearestDistrict
        let finalDistrict =
          !geoDistrict || geoDistrict.toLowerCase().includes("bhilwara") // example wrong mapping
            ? nearestDistrict
            : geoDistrict;

        if (isMounted) {
          // ✅ Only district name stored in currentCity
          dispatch(setCurrentCity(finalDistrict));
          dispatch(setCurrentState(stateName));
          dispatch(setCurrentAddress(address));
          dispatch(setAddress(address))
          

          console.log("District (currentCity):", finalDistrict);
          console.log("State:", stateName);
          console.log("Address:", address);
        }
      } catch (err) {
        console.error("Failed to fetch city:", err.message);
      }
    };

    if (!navigator.geolocation) {
      console.warn("Geolocation not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        dispatch(setLocation({lat:latitude,lon:longitude}))
        
        fetchCity(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation error:", error.message);
      },
      {
        enableHighAccuracy: false, // 🚀 Faster
        timeout: 8000,             // faster fallback
        maximumAge: 30000          // reuse last known GPS for speed
      }
    );

    return () => {
      isMounted = false;
    };
  }, [apiKey, dispatch]);

  return null;
}


export default useGetCity;
