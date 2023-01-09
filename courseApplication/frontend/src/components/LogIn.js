const LogIn = ({handleLogIn}) =>{
    const submitLogInForm = async (event) => {
      event.preventDefault()
      const username = event.target.username.value
      const password = event.target.password.value
      handleLogIn(username, password)
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