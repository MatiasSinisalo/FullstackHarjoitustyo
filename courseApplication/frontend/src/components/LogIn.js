import { Link, redirect, useNavigate, useParams, useSearchParams } from "react-router-dom"
import "./styles/login.css"
import { authenticateGoogleUser } from "../reducers/userReducer";
import { useApolloClient } from "@apollo/client";
import { useState } from "react";
import { GoogleLogin } from "./openID/GoogleLogin";
import { HYLogin } from "./openID/HYLogin";






const LogIn = ({handleLogIn}) =>{
    const submitLogInForm = async (event) => {
      event.preventDefault()
      const username = event.target.username.value
      const password = event.target.password.value
      handleLogIn(username, password)
    }


    return(
    <div className="login-section">
      <div className="login-block ">
      <h1 className="login-header">Log in page</h1>
  
      <div className="container primary">
        <form className="login-form" onSubmit={submitLogInForm}>
          <input className="important" placeholder="username" type = "text" name = "username"></input>
          <br></br>
          <input  className="important" placeholder="password" type="password" name="password"></input>
          <br></br>
          <input className="important action-button" type = "submit" value="LogIn"></input>
        </form>
        <p className="create-user-promt">dont have an account? create one <Link to="/createAccount">here</Link></p>
        <GoogleLogin></GoogleLogin>
        <HYLogin></HYLogin>
      </div>
      </div>
    </div>
    
    )
  }
  export default LogIn