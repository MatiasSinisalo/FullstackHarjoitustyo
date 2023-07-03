import { useDispatch } from "react-redux"
import { removeUserFromChatRoom, leaveChatRoom } from "../reducers/courseReducer"
import { useApolloClient } from "@apollo/client"

const ChatRoomUsers = ({course, chatRoom, user}) => {
    const dispatch = useDispatch()
    const client = useApolloClient()
    console.log(user.id)
    const canLeaveRoom = chatRoom.users.find((otherUser) => otherUser.username === user.username) ? true : false
    const leaveRoom = () => {
        dispatch(leaveChatRoom(course, chatRoom.id, user, client))
    }
    return(
        <>
        <h3>students in room: </h3>
        {canLeaveRoom ? <button onClick={leaveRoom}>leave chat room</button> : <></>}
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
            {chatRoom.admin.username === user.username ? <th><button className="dangerous-button" onClick={removeFromRoom}>remove</button></th> : <></>}
        </tr>
    )
}

export default ChatRoomUsers