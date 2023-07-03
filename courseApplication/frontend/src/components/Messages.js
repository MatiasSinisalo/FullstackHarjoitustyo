import "./styles/course.css"
const Messages = ({course, chatRoom}) =>{
    return(
      <>
      <p>messages: </p>
      <div className="course-messages scrollable">
        {chatRoom.messages.map((msg) => <p key={msg.id}>{msg.content} by: {msg.fromUser.username}</p>)}
      </div>
      </>
  
    )
  }

export default Messages