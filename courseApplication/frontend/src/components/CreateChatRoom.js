import { useDispatch } from "react-redux"
import { createChatRoom } from "../reducers/courseReducer"
import { useApolloClient } from "@apollo/client"

const CreateChatRoom = ({course}) => {
    const dispatch = useDispatch()
    const client = useApolloClient()
    const newChatRoom = (event) => {
        event.preventDefault()
        const chatRoomName = event.target.chatRoomName.value
        dispatch(createChatRoom(course, chatRoomName, client))
    }
    return (
        <form onSubmit={newChatRoom}>
            <input type="text" name="chatRoomName"></input>
            <input type="submit" value="create new chat room"></input>
        </form>
        
    )
}

export default CreateChatRoom