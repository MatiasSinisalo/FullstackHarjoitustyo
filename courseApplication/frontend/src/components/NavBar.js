import { useSelector } from "react-redux"

const NavBar = ({logOut}) => {
    const user = useSelector((store) => {return store.user})
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