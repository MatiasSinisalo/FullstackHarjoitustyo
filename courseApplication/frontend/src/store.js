import { configureStore } from "@reduxjs/toolkit";
import courseReducer from "./reducers/courseReducer";
import userReducer from "./reducers/userReducer";
import notificationReducer from "./reducers/notificationReducer";

const store = configureStore({
    reducer: {
        user: userReducer,
        notification: notificationReducer
    }
})

export default store