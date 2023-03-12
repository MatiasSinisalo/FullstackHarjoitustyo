import { useQuery } from "@apollo/client"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import CourseShowCase from "../components/CourseShowCase"
import { GET_ALL_COURSES } from "../queries/courseQueries"
import { getCoursesWithTeacher, getCoursesWithUser, setCourses } from '../reducers/courseReducer'
const Dashboard = () =>{
  const user = useSelector((store) => {return store.user})
  const dispatch = useDispatch()
  
  const allCourses = useQuery(GET_ALL_COURSES)
  const [usersCourses, setUsersCourses] = useState()
  const [coursesWhereUserTeaches, setCoursesWhereUserTeaches] = useState()

  useEffect(() => {
    if(!allCourses.loading)
    {
      dispatch(setCourses(allCourses.data.allCourses))
      setUsersCourses(dispatch(getCoursesWithUser(user.username)))
      setCoursesWhereUserTeaches(dispatch(getCoursesWithTeacher(user.username)))
      
    }
  }, [allCourses])
  

  
  
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