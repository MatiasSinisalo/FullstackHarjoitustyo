import {createSlice} from '@reduxjs/toolkit';

const notificationInitialState = {message: '', style: '', timeoutID: null};
const notificationSlice = createSlice({
  name: 'notification',
  initialState: notificationInitialState,
  reducers: {
    setNotification(state, action) {
      return {message: action.payload.message, style: action.payload.style, timeoutID: action.payload.timeoutID};
    },
  },
});


export const {setNotification} = notificationSlice.actions;

export const Notify = (message, style, visibleSeconds) => {
  return function(dispatch, getState) {
    const state = getState();
    const currentNotification = state.notification;
    if (currentNotification.timeoutID) {
      clearTimeout(currentNotification.timeoutID);
    }

    const timeoutID = setTimeout(() => {
      dispatch(setNotification({message: '', style: '', timeoutID: null}));
    }, visibleSeconds * 1000);

    dispatch(setNotification({message, style, timeoutID: timeoutID}));
  };
};

export default notificationSlice.reducer;
