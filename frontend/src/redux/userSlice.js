import { createSlice } from "@reduxjs/toolkit"

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
        currentCity: null,
        currentState: null,
        currentAddress: null,
        shopsInMyCity: null,
        itemsInMyCity: null,
        cartItems: [],
        totalAmount: 0,
        myOrders: [],
        searchItems: [],
        socket: null
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload
        },
        setCurrentCity: (state, action) => {
            state.currentCity = action.payload
        },
        setCurrentState: (state, action) => {
            state.currentState = action.payload
        },
        setCurrentAddress: (state, action) => {
            state.currentAddress = action.payload
        },

        setSocket: (state, action) => {
            state.socket = action.payload
        },

        setShopsInMyCity: (state, action) => {
            state.shopsInMyCity = action.payload
        },
        setItemsInMyCity: (state, action) => {
            state.itemsInMyCity = action.payload
        },

        addToCart: (state, action) => {
            const item = action.payload;
            const existingItem = state.cartItems.find((i) => i.id === item.id);

            if (existingItem) {
                existingItem.quantity += item.quantity || 1;
            } else {
                state.cartItems.push({ ...item, quantity: item.quantity || 1 });
            }
            state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
        },

        decreaseQuantity: (state, action) => {
            const { id } = action.payload;
            const existingItem = state.cartItems.find((i) => i.id === id);

            if (existingItem) {
                if (existingItem.quantity > 1) {
                    existingItem.quantity -= 1;
                } else {
                    state.cartItems = state.cartItems.filter((i) => i.id !== id);
                }
            }
            state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
        },

        removeFromCart: (state, action) => {
            const { id } = action.payload;
            state.cartItems = state.cartItems.filter((i) => i.id !== id);
            state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
        },

        clearCart: (state) => {
            state.cartItems = [];
            state.totalAmount = 0;
        },

        setMyOrders: (state, action) => {
            state.myOrders = action.payload
        },
        addMyOrder: (state, action) => {
            state.myOrders = [action.payload, ...state.myOrders]
        },

        updateOrderStatus: (state, action) => {
            const { orderId, shopId, status } = action.payload
            const order = state.myOrders.find(o => o._id === orderId)
            if (order) {
                const shopOrder = order.shopOrders.find(o => o.shop._id === shopId)
                if (shopOrder) shopOrder.status = status
            }
        },

        updateRealTimeOrderStatus: (state, action) => {
            const { orderId, shopId, status } = action.payload;
            const order = state.myOrders.find(o => o._id === orderId);

            if (order) {
                const shopOrder = order.shopOrders.find(so => so.shop._id === shopId);
                if (shopOrder) {
                    shopOrder.status = status;
                }
            }
        },

        setSearchItems: (state, action) => {
            state.searchItems = action.payload
        },

        // 🔥 NEW ADD — RESET ALL USER DATA WHEN LOGOUT
        resetUser: (state) => {
            state.userData = null;
            state.myOrders = [];
        }
    }
})

export const { 
    setUserData, addMyOrder, updateOrderStatus, setCurrentCity,
    setCurrentState, setItemsInMyCity, decreaseQuantity,
    removeFromCart, clearCart, setCurrentAddress, setShopsInMyCity,
    addToCart, setMyOrders, setSearchItems, setSocket,
    updateRealTimeOrderStatus, resetUser     // 👈 Added here!
} = userSlice.actions;

export default userSlice.reducer;
