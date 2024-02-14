import React from 'react'
import {useDispatch} from 'react-redux';
import {createChatRoom} from '../../reducers/courseReducer';
import {useApolloClient} from '@apollo/client';

const CreateChatRoom = ({course}) => {
  const dispatch = useDispatch();
  const client = useApolloClient();
  const newChatRoom = async (event) => {
    event.preventDefault();
    const chatRoomName = event.target.chatRoomName.value;
    await createChatRoom(course, chatRoomName, client);
  };
  return (
    <>
      <h3>create new chatroom</h3>
      <form onSubmit={newChatRoom}>
        <label htmlFor="charRoomName">chatroom name: </label>
        <input type="text" name="chatRoomName"></input>
        <input className="action-button" type="submit" value="create new chatroom"></input>
      </form>
    </>
  );
};

export default CreateChatRoom;
