import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import "./styles/navbar.css"
import Notification from "./Notification"
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
                <Notification></Notification>
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
                <Notification></Notification>
            </div>
        )
    }

}

export default NavBar