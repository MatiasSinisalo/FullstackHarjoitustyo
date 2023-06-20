import { useParams } from "react-router-dom"
import Messages from "./Messages"
import CreateMessage from "./CreateMessage"

const ChatRoom = ({course}) => {
    const chatRoomId = useParams().chatRoomId
    const chatRoom = course.chatRooms.find((room) => room.id === chatRoomId)

    return (
        <>
        <h1>{chatRoom.name}</h1>
        <p> this is a chat room page </p>
        <CreateMessage course={course} chatRoom={chatRoom}></CreateMessage>
        </>
    )
}


export default ChatRoom