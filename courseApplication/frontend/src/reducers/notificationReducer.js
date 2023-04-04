import { createSlice } from "@reduxjs/toolkit"

const notificationInitialState = {message: "this is a test notification", style: "successNotification",  timeoutID: null}
const notificationSlice = createSlice({
    name: 'notification',
    initialState: notificationInitialState,
    reducers: {
      setNotification(state, action){
          return action.payload
      }
    }
  })


  export const {setNotification} = notificationSlice.actions

export const Notify = (message, style) => {
    return function (dispatch, getState){
        setNotification({message, style, timeoutID: 0})
    }
}

  export default notificationSlice.reducer
  