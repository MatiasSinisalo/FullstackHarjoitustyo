import { createSlice } from '@reduxjs/toolkit'

const nullUser = {username: null, name: null, token: null}

const userSlice = createSlice({
  name: 'user',
  initialState: nullUser,
  reducers: {
    devTest(state, action) {
        console.log("this is a user reducer being called")

        state = {username: "placeholder", name: "name", token: "abc1234"}
    },
    
  },
})

export default userSlice.reducer
export const {devTest} = userSlice.actions
