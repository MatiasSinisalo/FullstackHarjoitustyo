import { useApolloClient, useQuery } from "@apollo/client"
import { Link } from "react-router-dom"
import CourseShowCase from "../components/CourseShowCase"
import { GET_ALL_COURSES } from "../queries/courseQueries"
import { ME } from "../queries/userQueries"
import { courseHasStudent } from '../reducers/courseReducer'
import "./styles/dashboard.css"

const Dashboard = () =>{
  const userQuery = useQuery(ME)//useSelector((store) => {return store.user})
  const client = useApolloClient()
  
  const allCoursesQuery = useQuery(GET_ALL_COURSES)
  if(allCoursesQuery.loading || userQuery.loading)
  {
    return (<p>loading...</p>)
  }
  const user = userQuery.data.me
  const allCourses = allCoursesQuery.data.allCourses
  const usersCourses = allCourses.filter((course) => courseHasStudent(course, user.username))
  const coursesWhereUserTeaches = allCourses.filter((course) => course.teacher.username === user.username)
    return(
    <div className="dashBoard">
      <h1>dashboard page</h1>
      <h2>Hello {user.username}</h2>
    

      <Link to="/CreateCourse">Create new Course</Link>
      <div className="dashBoardCourses">
        <h2>
          Your courses
        </h2>

        {
        usersCourses != undefined ? usersCourses.map((course) => <CourseShowCase key={course.uniqueName} course={course}></CourseShowCase>) : <></>
        }
    
        <hr className="seperatorLarge"></hr>
     
        <h2>
          Your courses where you are a teacher
        </h2>

        
        {
          coursesWhereUserTeaches != undefined ? coursesWhereUserTeaches.map((course) => <CourseShowCase key={course.uniqueName} course={course}></CourseShowCase>) : <></>
        }
      
      </div>
    </div>
    )
  }
  
export default Dashboard