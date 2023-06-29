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
    <div className="login-section secondary">
      <div className="login-block primary">
      <h1 className="login-header">Log in page</h1>
  

      <form className="login-form" onSubmit={submitLogInForm}>
        <input className="important" placeholder="username" type = "text" name = "username"></input>
        <br></br>
        <input  className="important" placeholder="password" type="password" name="password"></input>
        <br></br>
        <input className="important" type = "submit" value="LogIn"></input>
      </form>
      <p className="create-user-promt">dont have an account? create one <Link to="/createAccount">here</Link></p>
      </div>
    </div>
    )
  }
  export default LogIn