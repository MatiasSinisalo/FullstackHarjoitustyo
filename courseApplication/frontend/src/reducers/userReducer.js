import { createSlice } from '@reduxjs/toolkit'
import { createUser } from '../services/logInService'

export const createNewUser = (username, name, password, client) => {
  return async function (dispatch){
    console.log("creating a new user: ")
    const userdata = await createUser(username, name, password, client)
    return userdata
  }
}