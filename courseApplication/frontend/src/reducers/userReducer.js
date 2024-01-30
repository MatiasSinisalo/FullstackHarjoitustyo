import { createSlice } from '@reduxjs/toolkit'
import loginService from '../services/logInService'
import { Notify } from "./notificationReducer";
import store from "../store"
import { Navigate, redirect } from 'react-router-dom';

export const createNewUser = (username, name, password, client) => {
  return async function (dispatch){
    console.log("creating a new user: ")
    const userdata = await loginService.createUser(username, name, password, client)
    return userdata
  }
}


export const authenticateGoogleUser = async (googleToken, client, navigate) => {
  const userAuthQuery =  await loginService.authenticateGoogleUser(googleToken, client)
  if(!userAuthQuery.error)
  {


      console.log(userAuthQuery)
      store.dispatch(Notify(`successfully authenticated user ${userAuthQuery.value}`, "successNotification", 5))
      console.log(userAuthQuery)
      if(userAuthQuery.type === "TOKEN_CREATE_ACCOUNT")
      {
        console.log("redirecting")
        localStorage.setItem('courseApplicationCreateUserToken', userAuthQuery.token.value)
        navigate('/createAccount/fillInInformation/google')
        return true
      }
      else if(userAuthQuery.type === "TOKEN_LOGIN_SUCCESS")
      {
        localStorage.setItem('courseApplicationUserToken', userAuthQuery.token.value)
        navigate('/dashboard')
        return true
      }
      
  }
  else{
      store.dispatch(Notify(`${userAuthQuery.error.message}`, "errorNotification", 5))
      return false
  }
}

export const finalizeGoogleUserCreation = async (username, createUserToken, client, navigate) => {
  const userFinalizeQuery =  await loginService.finalizeGoogleUserCreation(username, createUserToken, client)
  if(!userFinalizeQuery.error)
  {
      console.log(userFinalizeQuery)
      store.dispatch(Notify(`successfully created user ${userFinalizeQuery.username}`, "successNotification", 5))
      localStorage.removeItem('courseApplicationCreateUserToken')
      console.log(userFinalizeQuery)
      navigate('/')
      return true
  }
  else{
      store.dispatch(Notify(`${userFinalizeQuery.error.message}`, "errorNotification", 5))
      return false
  }
}


export const authenticateHYUser = async (HYToken, client, navigate) => {
  const HYUserAuthQuery = await loginService.authenticateHYUser(HYToken, client)
  if(!HYUserAuthQuery?.error)
  {
      reactToAuthenticateResult(HYUserAuthQuery, "/createAccount/fillInInformation/HY", "/dashboard", navigate)
  }
  console.log(HYUserAuthQuery)
}

const reactToAuthenticateResult = (userAuthQuery, accountCreateUrl, successLoginUrl, navigate) => {
      console.log(userAuthQuery)
      store.dispatch(Notify(`successfully authenticated user ${userAuthQuery.value}`, "successNotification", 5))
      console.log(userAuthQuery)
      if(userAuthQuery.type === "TOKEN_CREATE_ACCOUNT")
      {
        console.log("redirecting")
        localStorage.setItem('courseApplicationCreateUserToken', userAuthQuery.token.value)
        navigate(accountCreateUrl)
        return true
      }
      else if(userAuthQuery.type === "TOKEN_LOGIN_SUCCESS")
      {
        localStorage.setItem('courseApplicationUserToken', userAuthQuery.token.value)
        navigate(successLoginUrl)
        return true
      }
}


export const finalizeHYUserCreation = async (username, createUserToken, client, navigate) => {
  const userFinalizeQuery =  await loginService.finalizeHYUserCreation(username, createUserToken, client)
  return finishOpenIDUserCreation(userFinalizeQuery, navigate)
}


const finishOpenIDUserCreation = (userFinalizeQuery, navigate) => {
  if(!userFinalizeQuery?.error)
  {
    console.log(userFinalizeQuery)
    store.dispatch(Notify(`successfully created user`, "successNotification", 5))
    localStorage.removeItem('courseApplicationCreateUserToken')
    console.log(userFinalizeQuery)
    navigate('/')
    return true
  }
  else{
    store.dispatch(Notify(`${userFinalizeQuery.error.message}`, "errorNotification", 5))
    return false
  }
}