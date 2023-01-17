import { configureStore } from "@reduxjs/toolkit";
import courseReducer from "./reducers/courseReducer";
import userReducer from "./reducers/userReducer";

const store = configureStore({
    reducer: {
        user: userReducer,
        courses: courseReducer
    }
})

export default store