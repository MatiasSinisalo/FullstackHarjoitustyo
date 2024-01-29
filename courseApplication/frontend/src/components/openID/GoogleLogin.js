import { Link, redirect, useNavigate, useParams, useSearchParams } from "react-router-dom"
import "../styles/login.css"
import { authenticateGoogleUser } from "../../reducers/userReducer";
import { useApolloClient } from "@apollo/client";
import { useState } from "react";

const GoogleLogin = ({}) => {
    const [searchParams, setSearchParams] = useSearchParams();
   
    const param = searchParams.get("code")
    const client = useApolloClient()
    const navigate = useNavigate()
   
    if(param != null){
      // send code to backend to then get the user id token
      authenticateGoogleUser(param, client, navigate)
      return("logging in with google...")
    }
    const client_id = '526000597568-srhi8bscvhvi2s7br23bomf7vvgrskkr.apps.googleusercontent.com'
    const redirect_uri = 'https://frontend-ohtuprojekti-staging.ext.ocp-test-0.k8s.it.helsinki.fi/login/google';
  
    return(
      <>
        <a href={`https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=openid%20email%20profile`}
        >login using google</a>
        
      </>
    )
  }
  
const GoogleAuthenticate = ({}) => {
    const [searchParams, setSearchParams] = useSearchParams();
   
    const param = searchParams.get("code")
    const client = useApolloClient()
    const navigate = useNavigate()
   
    if(param != null){
      // send code to backend to then get the user id token
      authenticateGoogleUser(param, client, navigate)
      return("logging in with google...")
    }
  
    redirect('/')
  }


export {GoogleLogin, GoogleAuthenticate}