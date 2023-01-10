const NavBar = ({user, logOut}) => {
    if(user.username)
    {
        return (
            <div>
                <button onClick={logOut}>Log Out</button>
            </div>
        )
    }
    else
    {
        return (
            <div>
                <p>please log in</p>
            </div>
        )
    }

}

export default NavBar