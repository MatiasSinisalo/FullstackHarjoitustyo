import { Link, redirect, useNavigate, useParams, useSearchParams } from "react-router-dom"
import "../styles/login.css"
import { useApolloClient } from "@apollo/client";
import { useState } from "react";
import { authenticateHYUser } from "../../reducers/userReducer";

const HYLogin = ({}) => {
    const client_id = 'id_af7f822a95ec6e8b8316268f679b9aa6'
    const redirect_uri = 'https://frontend-ohtuprojekti-staging.ext.ocp-test-0.k8s.it.helsinki.fi/login/HY';
  
  
    return(
      <>
        <a href={`https://login-test.it.helsinki.fi/idp/profile/oidc/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=openid%20profile%20uid%20name`}>
          log in using HY
        </a>
      </>
    )
  }



const HYAuthenticate = ({}) => {
    const [searchParams, setSearchParams] = useSearchParams();
   
    const param = searchParams.get("code")
    const client = useApolloClient()
    const navigate = useNavigate()
   
    if(param != null){
      // send code to backend to then get the user id token
      authenticateHYUser(param, client, navigate)
      return("logging in with HY...")
    }
  
    navigate('/')
}


export {HYLogin, HYAuthenticate}