import { useSelector } from "react-redux"
import { Link } from "react-router-dom"


const Dashboard = () =>{
  const user = useSelector((store) => {return store.user})
  console.log(user)
    return(
      <>
      <h1>Hello {user.username}</h1>
      <p>dashboard page</p>

      <Link to="/CreateCourse">Create new Course</Link>

      </>
  
    )
  }
  
export default Dashboard