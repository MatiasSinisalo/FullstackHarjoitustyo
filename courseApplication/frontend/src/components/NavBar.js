import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import "./styles/navbar.css"
const NavBar = ({logOut}) => {
    const user = useSelector((store) => {return store.user})
    if(user.username)
    {
        return (
            <div className="navBar">
                <button onClick={logOut}>Log Out</button>
                <Link className="navBarLink" to="/dashboard">dashboard</Link>
                <Link className="navBarLink" to="/CourseBrowser">Courses</Link>
            </div>
        )
    }
    else
    {
        return (
            <div className="navBar">
                <p>please log in <Link to="/">here</Link></p>
            </div>
        )
    }

}

export default NavBar