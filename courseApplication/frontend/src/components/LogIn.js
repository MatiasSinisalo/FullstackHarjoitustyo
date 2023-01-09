import {useNavigate} from 'react-router-dom'
import { useUserLogIn } from '../services/logInService'

const LogIn = () =>{
    const navigate = useNavigate()
    const LogInAsUser = useUserLogIn()
    
    
    const submitLogInForm = async (event) => {
      console.log("trying to log in")
      event.preventDefault()
      const username = event.target.username.value
      const password = event.target.password.value
      
      const token = LogInAsUser(username, password)
      if(token)
      {
        navigate('/dashboard')
      }
    
    }


    return(
    <>
      <p>Log in page</p>
  

      <form onSubmit={submitLogInForm}>
        <input id="usernameInputField" type = "text" name = "username"></input>
        <br></br>
        <input id="passwordInputField" type="password" name="password"></input>
        <br></br>
        <input type = "submit" value="LogIn"></input>
      </form>


    </>
    )
  }
  export default LogIn