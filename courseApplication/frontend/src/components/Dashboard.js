import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import CourseShowCase from "../components/CourseShowCase"
import { getCoursesWithTeacher, getCoursesWithUser } from '../reducers/courseReducer'
const Dashboard = () =>{
  const user = useSelector((store) => {return store.user})
  const dispatch = useDispatch()
  const usersCourses = dispatch(getCoursesWithUser(user.username))
  const coursesWhereUserTeaches = dispatch(getCoursesWithTeacher(user.username))
  console.log(usersCourses)
    return(
      <>
      <h1>Hello {user.username}</h1>
      <p>dashboard page</p>

      <Link to="/CreateCourse">Create new Course</Link>

      <h1>
        Your courses
      </h1>

      {
       usersCourses != undefined ? usersCourses.map((course) => <CourseShowCase key={course.uniqueName} course={course}></CourseShowCase>) : <></>
      }

      <h1>
        Your courses where you are a teacher
      </h1>

      
         {
          coursesWhereUserTeaches != undefined ? coursesWhereUserTeaches.map((course) => <CourseShowCase key={course.uniqueName} course={course}></CourseShowCase>) : <></>
         }
      </>
  
    )
  }
  
export default Dashboard