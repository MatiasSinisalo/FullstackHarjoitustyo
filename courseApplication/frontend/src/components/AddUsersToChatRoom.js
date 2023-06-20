import { useApolloClient } from "@apollo/client"
import { useDispatch } from "react-redux"
import { addUserToChatRoom } from "../reducers/courseReducer"



const AddUsersToChatRoom = ({course, chatRoom}) => {

    const dispatch = useDispatch()
    const client = useApolloClient()
    const addUser = (event) => {
        event.preventDefault()
        console.log(event.target.username.value)
        const username = event.target.username.value
        dispatch(addUserToChatRoom(course, chatRoom.id, username, client))
    }
    return (
       <form onSubmit={addUser}>
        <input type="text" name="username"></input>
        <input type="submit" value="add user"></input>

       </form>
    )
}

export default AddUsersToChatRoom