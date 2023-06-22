import { useParams } from "react-router-dom"
import Messages from "./Messages"
import CreateMessage from "./CreateMessage"
import AddUsersToChatRoom from "./AddUsersToChatRoom"
import ChatRoomUsers from "./ChatRoomUsers"
import { useApolloClient, useSubscription } from "@apollo/client"
import { SUBSCRIBE_TO_MESSAGE_CREATED } from "../queries/courseQueries"

const ChatRoom = ({course, user}) => {
    const chatRoomId = useParams().chatRoomId
    const chatRoom = course.chatRooms.find((room) => room.id === chatRoomId)
    const client = useApolloClient()
    useSubscription(SUBSCRIBE_TO_MESSAGE_CREATED, {
        variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoom?.id},
        onData({data}){
            console.log(data)
            const messageCreated = data.data.messageCreated
            //TODO: maybe sort messages to avoid wrong order?
            client.cache.modify(
            {
                id: `ChatRoom:${chatRoom.id}`,
                fields: {
                    messages(currentMessages){
                        console.log(messageCreated)
                        return currentMessages.concat(messageCreated)
                    }
                }
            })
        }
    })
  
    return (
        <>
        <h1>{chatRoom.name}</h1>
        <p> this is a chat room page </p>
        <Messages course={course} chatRoom={chatRoom}></Messages>
        <CreateMessage course={course} chatRoom={chatRoom}></CreateMessage>
        <ChatRoomUsers course={course} chatRoom={chatRoom} user={user}/>
        {chatRoom.admin.username === user.username ? <AddUsersToChatRoom course={course} chatRoom={chatRoom}/> : <></>}
        
        </>
    )
}


export default ChatRoom