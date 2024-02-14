import React from 'react'
import {useNavigate, useSearchParams} from 'react-router-dom';
import '../styles/login.css';
import {authenticateGoogleUser, finalizeGoogleUserCreation} from '../../reducers/userReducer';
import {useApolloClient} from '@apollo/client';

const GoogleLogin = ({}) => {
  const client_id = '526000597568-srhi8bscvhvi2s7br23bomf7vvgrskkr.apps.googleusercontent.com';
  const redirect_uri = 'https://frontend-ohtuprojekti-staging.ext.ocp-test-0.k8s.it.helsinki.fi/login/google';

  return (
    <div>
      <a href={`https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=openid%20email%20profile`}
      >login using google</a>

    </div>
  );
};

const GoogleAuthenticate = ({}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const param = searchParams.get('code');
  const client = useApolloClient();
  const navigate = useNavigate();

  if (param != null) {
    // send code to backend to then get the user id token
    authenticateGoogleUser(param, client, navigate);
    return ('logging in with google...');
  }

  navigate('/');
};

const FillInUserInformationGoogle = () => {
  const client = useApolloClient();
  const navigate = useNavigate();
  const userCreateAccountToken = localStorage.getItem('courseApplicationCreateUserToken');
  if (!userCreateAccountToken) {
    navigate('/');
  }
  const sendAccountInfo = async (event) => {
    event.preventDefault();
    const username = event.target.username.value;
    finalizeGoogleUserCreation(username, userCreateAccountToken, client, navigate);
  };

  return (
    <>
      <h1>Please fill in missing information</h1>
      <form className="container primary" onSubmit={sendAccountInfo}>

        <input placeholder="username" type="text" name="username"></input>
        <br></br>

        <input type="submit" className="action-button" value="send"></input>
      </form>
    </>);
};


export {GoogleLogin, GoogleAuthenticate, FillInUserInformationGoogle};
