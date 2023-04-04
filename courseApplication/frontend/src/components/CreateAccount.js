import { useApolloClient } from "@apollo/client";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {createNewUser} from "../reducers/userReducer"
import { Notify } from "../reducers/notificationReducer";
import './styles/createAccount.css'


const CreateAccount = () => {
    const dispatch = useDispatch()
    const client = useApolloClient()
    const createNewAccount = async (event) => {
        event.preventDefault();
        const username = event.target.username.value
        const name = event.target.name.value
        const password = event.target.password.value
        const userQuery = await dispatch(createNewUser(username, name, password, client))
        if(userQuery.username)
        {
            dispatch(Notify(`successfully created user ${userQuery.username}`, "successNotification", 5))
        } 
        else{
            dispatch(Notify(`${userQuery.message}`, "errorNotification", 5))
        }
    }

    return  (
        <div className="accountCreationSection blueBox">
            <Link to="/">Back to Log In page</Link>
            <h1>Create a new account</h1>
            <form  className="accountCreationForm" onSubmit={createNewAccount}>
               
                <input placeholder="username" type="text" name="username"></input>
                <br></br>
              
                <input placeholder="name" type="text" name="name"></input>
                <br></br>
               
                <input placeholder="password" type="password" name="password"></input>
                <br></br>
                <input type="submit" value="create new account"></input>
            </form>
        </div>
    )
}

export default CreateAccount