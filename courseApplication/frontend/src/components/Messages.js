const Messages = ({course, chatRoom}) =>{
    return(
      <>
      <p>messages: </p>
      {chatRoom.messages.map((msg) => <p key={msg.id}>{msg.content} by: {msg.fromUser.username}</p>)}
      </>
  
    )
  }

export default Messages