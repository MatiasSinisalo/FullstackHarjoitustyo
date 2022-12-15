const LogIn = () =>{
    const submitLogInForm = (event) => {
      event.preventDefault()
      const username = event.target.username.value
      const password = event.target.password.value
      



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