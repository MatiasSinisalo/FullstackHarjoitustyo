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
    return(
        <tr>
            <th>{roomUser.username}</th>
            {chatRoom.admin.username === user.username ? <th><button>remove</button></th> : <></>}
        </tr>
    )
}

export default ChatRoomUsers