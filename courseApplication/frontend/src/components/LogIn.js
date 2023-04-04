import { Link } from "react-router-dom"
import "./styles/login.css"
const LogIn = ({handleLogIn}) =>{
    const submitLogInForm = async (event) => {
      event.preventDefault()
      const username = event.target.username.value
      const password = event.target.password.value
      handleLogIn(username, password)
    }


    return(
    <div className="loginSection blueBox">
      <p>Log in page</p>
  

      <form className="loginForm" onSubmit={submitLogInForm}>
        <input placeholder="username" id="usernameInputField" type = "text" name = "username"></input>
        <br></br>
        <input placeholder="password" id="passwordInputField" type="password" name="password"></input>
        <br></br>
        <input type = "submit" value="LogIn"></input>
      </form>
      <p className="createUserPromt">dont have an account? create one <Link to="/createAccount">here</Link></p>

    </div>
    )
  }
  export default LogIn