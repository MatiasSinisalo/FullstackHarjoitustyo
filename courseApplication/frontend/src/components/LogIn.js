import { Link, redirect, useNavigate, useParams, useSearchParams } from "react-router-dom"
import "./styles/login.css"
import { authenticateGoogleUser } from "../reducers/userReducer";
import { useApolloClient } from "@apollo/client";
import { useState } from "react";
import { GoogleLogin } from "./openID/GoogleLogin";


const HYLogin = ({}) => {
  const client_id = 'id_af7f822a95ec6e8b8316268f679b9aa6'
  const redirect_uri = 'https://frontend-ohtuprojekti-staging.ext.ocp-test-0.k8s.it.helsinki.fi/';


  return(
    <>
      <a href={`https://login-test.it.helsinki.fi/idp/profile/oidc/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=openid%20profile`}>
        log in using HY
      </a>
    </>
  )
}



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