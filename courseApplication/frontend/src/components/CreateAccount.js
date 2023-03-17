import { useApolloClient } from "@apollo/client";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {createNewUser} from "../reducers/userReducer"

const CreateAccount = () => {
    const dispatch = useDispatch()
    const client = useApolloClient()
    const createNewAccount = async (event) => {
        event.preventDefault();
        const username = event.target.username.value
        const name = event.target.name.value
        const password = event.target.password.value
        const user = await dispatch(createNewUser(username, name, password, client))
        if(user)
        {
            window.alert(`created user ${user.username}`)
        } 
    }

    return  (
        <>
            <Link to="/">Back to Log In page</Link>
            <h1>Create a new account</h1>
            <form onSubmit={createNewAccount}>
                <p>username</p>
                <input type="text" name="username"></input>
                <br></br>
                <p>name</p>
                <input type="text" name="name"></input>
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