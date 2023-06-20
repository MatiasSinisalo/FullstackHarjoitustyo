

const CreateMessage = ({course, chatRoom}) => {
    const newMessage = (event) => {
        event.preventDefault()
        console.log(event.target.content.value)
    }

    return(
        <form onSubmit={newMessage}>
            <input type="test" name="content"></input>
            <input type="submit" value="send"></input>
        </form>
    )
}

export default CreateMessage