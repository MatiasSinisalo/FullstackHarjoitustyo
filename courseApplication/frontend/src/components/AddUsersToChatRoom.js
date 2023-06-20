

const AddUsersToChatRoom = () => {

    const addUser = (event) => {
        event.preventDefault()
        console.log(event.target.username.value)
        
    }
    return (
       <form onSubmit={addUser}>
        <input type="text" name="username"></input>
        <input type="submit" value="add user"></input>

       </form>
    )
}

export default AddUsersToChatRoom