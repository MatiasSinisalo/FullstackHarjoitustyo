import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import "./styles/navbar.css"
const NavBar = ({logOut}) => {
    const user = useSelector((store) => {return store.user})
    if(user.username)
    {
        return (
            <div>
                <button onClick={logOut}>Log Out</button>
                <Link className="navBarLink" to="/dashboard">dashboard</Link>
                <Link className="navBarLink" to="/CourseBrowser">Courses</Link>


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