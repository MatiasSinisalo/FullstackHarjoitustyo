import { useApolloClient } from "@apollo/client"
import { useDispatch } from "react-redux"
import { createMessage } from "../reducers/courseReducer"


const CreateMessage = ({course, chatRoom}) => {
    const dispatch = useDispatch()
    const client = useApolloClient()
    const newMessage = (event) => {
        event.preventDefault()
        console.log(event.target.content.value)
        const content = event.target.content.value
        dispatch(createMessage(course, chatRoom.id, content, client))
    }

    return(
        <form onSubmit={newMessage}>
            <input type="test" name="content"></input>
            <input className="action-button" type="submit" value="send"></input>
        </form>
    )
}

export default CreateMessage