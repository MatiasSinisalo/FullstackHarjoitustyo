import { useParams } from "react-router-dom"
import Messages from "./Messages"
import CreateMessage from "./CreateMessage"
import AddUsersToChatRoom from "./AddUsersToChatRoom"

const ChatRoom = ({course, user}) => {
    const chatRoomId = useParams().chatRoomId
    const chatRoom = course.chatRooms.find((room) => room.id === chatRoomId)

    return (
        <>
        <h1>{chatRoom.name}</h1>
        <p> this is a chat room page </p>
        <Messages course={course} chatRoom={chatRoom}></Messages>
        <CreateMessage course={course} chatRoom={chatRoom}></CreateMessage>
        {chatRoom.admin.username === user.username ? <AddUsersToChatRoom course={course} chatRoom={chatRoom}/> : <></>}
        </>
    )
}


export default ChatRoom