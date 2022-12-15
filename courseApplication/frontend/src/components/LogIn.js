import { useMutation } from '@apollo/client'
import {LOGIN} from '../queries/userQueries'

const LogIn = () =>{
    const [login, loginQueryResult] = useMutation(LOGIN)
    const submitLogInForm = async (event) => {
      console.log("trying to log in")
      event.preventDefault()
      const username = event.target.username.value
      const password = event.target.password.value
      const result = await login({variables: {username, password}})
      console.log(result)
    }


    return(
    <>
      <p>Log in page</p>
  

      <form onSubmit={submitLogInForm}>
        <input type = "text" name = "username"></input>
        <br></br>
        <input type="password" name="password"></input>
        <br></br>
        <input type = "submit" value="LogIn"></input>
      </form>


    </>
    )
  }
  export default LogIn