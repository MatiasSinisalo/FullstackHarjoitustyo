import React from 'react'
import {Link, useParams} from 'react-router-dom';
import Messages from './Messages';
import CreateMessage from './CreateMessage';
import AddUsersToChatRoom from './AddUsersToChatRoom';
import ChatRoomUsers from './ChatRoomUsers';
import {useApolloClient, useSubscription} from '@apollo/client';
import {SUBSCRIBE_TO_MESSAGE_CREATED} from '../../queries/courseQueries';
import {useDispatch} from 'react-redux';
import {removeChatRoom} from '../../reducers/courseReducer';

const ChatRoom = ({course, user}) => {
  const chatRoomId = useParams().chatRoomId;
  const chatRoom = course.chatRooms.find((room) => room.id === chatRoomId);
  const client = useApolloClient();
  const dispatch = useDispatch();
  useSubscription(SUBSCRIBE_TO_MESSAGE_CREATED, {
    variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoom?.id},
    onData({data}) {
      const messageCreated = data.data.messageCreated;

      // no need to update if its our own message
      if (messageCreated.fromUser.username === user.username) {
        return;
      }

      // TODO: maybe sort messages to avoid wrong order?
      client.cache.modify(
          {
            id: `ChatRoom:${chatRoom.id}`,
            fields: {
              messages(currentMessages) {
                return currentMessages.concat({__ref: `Message:${messageCreated.id}`});
              },
            },
          });
    },
  });

  const removeRoom = async () => {
    console.log('removing room');
    await removeChatRoom(course, chatRoom, client);
  };

  if (!chatRoom) {
    return (
      <Link to={`/course/${course.uniqueName}`}>it seems this chatRoom does not exist, click here to go to course page</Link>
    );
  }

  return (
    <>
      <div className="container primary">
        <h1>{chatRoom.name}</h1>
        <p> this is a chat room page </p>
        {chatRoom.admin.username === user.username ? <button className="dangerous-button" onClick={removeRoom}>remove chatRoom</button> : <></>}
        <Messages course={course} chatRoom={chatRoom}></Messages>
        <CreateMessage course={course} chatRoom={chatRoom}></CreateMessage>
        <ChatRoomUsers course={course} chatRoom={chatRoom} user={user}/>
        {chatRoom.admin.username === user.username ? <AddUsersToChatRoom course={course} chatRoom={chatRoom}/> : <></>}
      </div>
    </>
  );
};


export default ChatRoom;
