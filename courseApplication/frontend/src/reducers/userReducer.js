import { createSlice } from '@reduxjs/toolkit'

const nullUser = {username: null, name: null, token: null}

const userSlice = createSlice({
  name: 'user',
  initialState: nullUser,
  reducers: {
    updateUser (state, action){
        return action.payload
    }
    
  },
})

export default userSlice.reducer
export const {updateUser} = userSlice.actions
