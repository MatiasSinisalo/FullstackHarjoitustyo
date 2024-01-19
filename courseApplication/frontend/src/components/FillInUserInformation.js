import { useApolloClient, useQuery } from "@apollo/client"
import { AUTHENTICATE_GOOGLE_USER } from "../queries/userQueries"
import { finalizeGoogleUserCreation } from "../reducers/userReducer"
import { useNavigate } from "react-router-dom"



const FillInUserInformation = () => {
    const client = useApolloClient()
    const navigate = useNavigate()
    const userCreateAccountToken = localStorage.getItem('courseApplicationCreateUserToken')
    if(!userCreateAccountToken){
        navigate('/')
    }
    const sendAccountInfo = async (event) => {
        event.preventDefault();
        const username = event.target.username.value
        finalizeGoogleUserCreation(username, userCreateAccountToken, client, navigate)
    }

    return (
    <>
        <h1>Please fill in missing information</h1>
        <form  className="container primary" onSubmit={sendAccountInfo}>
            
            <input placeholder="username" type="text" name="username"></input>
            <br></br>
            
            <input type="submit" className="action-button" value="send"></input>
        </form>
    </>)
}


export default FillInUserInformation