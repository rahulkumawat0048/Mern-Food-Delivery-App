import { createSlice } from "@reduxjs/toolkit";

const ownerSlice = createSlice({
  name: "owner",
  initialState: {
    myShopData: null,
    loading: false,
    error: null
  },
  reducers: {
    setMyShopData: (state, action) => {
      state.myShopData = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetOwner: (state) => {
      state.myShopData = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setMyShopData, setLoading, setError, resetOwner } = ownerSlice.actions;
export default ownerSlice.reducer;
