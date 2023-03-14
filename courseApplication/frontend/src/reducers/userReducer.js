import { createSlice } from '@reduxjs/toolkit'
import { createUser } from '../services/logInService'

const nullUser = {username: null, name: null, token: null}

const userSlice = createSlice({
  name: 'user',
  initialState: nullUser,
  reducers: {
    updateUser (state, action){
        return action.payload
    }
  }
})


export const {updateUser} = userSlice.actions

export const createNewUser = (username, name, password, client) => {
  return async function (dispatch){
    console.log("creating a new user: ")
    const userdata = await createUser(username, name, password, client)
    return userdata
  }
}




export default userSlice.reducer