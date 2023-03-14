

const CreateAccount = () => {

    return  (
        <>
            <h1>Create a new account</h1>
            <form>
                <p>username</p>
                <input type="text" name="username"></input>
                <br></br>
                <p>password</p>
                <input type="password" name="password"></input>
                <br></br>
                <p></p>
                <input type="submit" value="create new account"></input>
            </form>
        </>
    )
}

export default CreateAccount