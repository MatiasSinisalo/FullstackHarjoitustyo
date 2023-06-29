import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import "./styles/navbar.css"
const NavBar = ({logOut}) => {
    const user = useSelector((store) => {return store.user})
    if(user.username)
    {
        return (
            <div className="navbar background">
                <div className="navbar-content secondary">
                    <button onClick={logOut}>Log Out</button>
                    <Link className="navBarLink" to="/dashboard">dashboard</Link>
                    <Link className="navBarLink" to="/CourseBrowser">Courses</Link>
                </div>
            </div>
        )
    }
    else
    {
        return (
            <div className="navbar background">
                <div className="navbar-content secondary">
                    <p>please log in <Link to="/">here</Link></p>
                </div>
            </div>
        )
    }

}

export default NavBar