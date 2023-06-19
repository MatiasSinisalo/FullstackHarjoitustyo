

const CreateChatRoom = ({course}) => {
    const createChatRoom = (event) => {
        event.preventDefault()
        console.log(event.target.chatRoomName.value)
    }
    return (
        <form onSubmit={createChatRoom}>
            <input type="text" name="chatRoomName"></input>
            <input type="submit" value="create new chat room"></input>
        </form>
        
    )
}

export default CreateChatRoom