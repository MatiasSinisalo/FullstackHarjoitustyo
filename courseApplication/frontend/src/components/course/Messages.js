import React from 'react'
import '../styles/course.css';

const Messages = ({course, chatRoom}) =>{
  console.log('re rendered messages!');
  return (
    <>
      <p>messages: </p>
      <div onScroll={() => console.log('scrolled!')} className="scrollable course-messages">
        <div className="course-messages-content">
          {chatRoom.messages.map((msg) => <p key={msg.id}>{msg.content} by: {msg.fromUser.username}</p>)}
        </div>
      </div>
    </>

  );
};

export default Messages;
