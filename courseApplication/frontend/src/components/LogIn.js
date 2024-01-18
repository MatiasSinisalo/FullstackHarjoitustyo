import { Link, useParams, useSearchParams } from "react-router-dom"
import "./styles/login.css"
import { authenticateGoogleUser } from "../reducers/userReducer";
import { useApolloClient } from "@apollo/client";

const GoogleLogin = ({}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  console.log("heelou")
  const param = searchParams.get("code")
  const client = useApolloClient()
  console.log(param)
  if(param != null){
    // send code to backend to then get the user id token
    authenticateGoogleUser(param, client)
    return("logging in with google...")
  }
  const client_id = 'redacted';
  const redirect_uri = 'http://localhost:3000/';

  return(
    <>
      <a href={`https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=openid%20email`}
      >login using google</a>
      
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
      </div>
      </div>
    </div>
    
    )
  }
  export default LogIn