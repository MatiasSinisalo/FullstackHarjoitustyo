const NavBar = ({user}) => {
    if(user)
    {
        return (
            <div>
                <button>Log Out</button>
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