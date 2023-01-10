import { createSlice } from '@reduxjs/toolkit'
import {useUser} from '../services/logInService'

const nullUser = {username: null, name: null, token: null}

const userSlice = createSlice({
  name: 'user',
  initialState: nullUser,
  reducers: {
    userLogIn(){
        
    }
    
  },
})

export default userSlice.reducer
export const {userLogIn} = userSlice.actions
