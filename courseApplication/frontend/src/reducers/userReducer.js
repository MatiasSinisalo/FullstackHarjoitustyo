import { createSlice } from '@reduxjs/toolkit'
import loginService from '../services/logInService'
import { Notify } from "./notificationReducer";
import store from "../store"

export const createNewUser = (username, name, password, client) => {
  return async function (dispatch){
    console.log("creating a new user: ")
    const userdata = await loginService.createUser(username, name, password, client)
    return userdata
  }
}


export const authenticateGoogleUser = async (googleToken, client) => {
  const userAuthQuery =  await loginService.authenticateGoogleUser(googleToken, client)
  if(!userAuthQuery.error)
  {
      console.log(userAuthQuery)
      store.dispatch(Notify(`successfully authenticated user ${userAuthQuery.value}`, "successNotification", 5))
      return true
  }
  else{
      store.dispatch(Notify(`${userAuthQuery.error.message}`, "errorNotification", 5))
      return false
  }
}