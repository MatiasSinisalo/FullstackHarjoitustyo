import { useDispatch } from "react-redux"
import { removeUserFromChatRoom } from "../reducers/courseReducer"
import { useApolloClient } from "@apollo/client"

const ChatRoomUsers = ({course, chatRoom, user}) => {
    return(
        <>
        <h3>students in room: </h3>
        <table>
            <thead>
                <tr>
                    <th>username</th>
                    {chatRoom.admin.username === user.username ? <th>remove from room</th> : <></>}
                </tr>
            </thead>
            <tbody>
                {chatRoom.users.map((roomUser)=><ChatRoomUser key={roomUser.id} course={course} chatRoom={chatRoom} roomUser={roomUser} user={user}/>)}
            </tbody>
        </table>
        </>
    )
}

const ChatRoomUser = ({course, chatRoom, roomUser, user}) => {
    const dispatch = useDispatch()
    const client = useApolloClient()
    const removeFromRoom = () => {
        dispatch(removeUserFromChatRoom(course, chatRoom.id, roomUser, client))
    }
    return(
        <tr>
            <th>{roomUser.username}</th>
            {chatRoom.admin.username === user.username ? <th><button onClick={removeFromRoom}>remove</button></th> : <></>}
        </tr>
    )
}

export default ChatRoomUsers