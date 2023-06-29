import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import "./styles/navbar.css"
const NavBar = ({logOut}) => {
    const user = useSelector((store) => {return store.user})
    if(user.username)
    {
        return (
            <div className="navbar background">
                <div className="navbar-content primary">
                    <button className="action-button" onClick={logOut}>Log Out</button>
                    <Link className="navbar-link" to="/dashboard">dashboard</Link>
                    <Link className="navbar-link" to="/CourseBrowser">Courses</Link>
                </div>
            </div>
        )
    }
    else
    {
        return (
            <div className="navbar background">
                <div className="navbar-content primary">
                    <Link to="/">please log in here</Link>
                </div>
            </div>
        )
    }

}

export default NavBar