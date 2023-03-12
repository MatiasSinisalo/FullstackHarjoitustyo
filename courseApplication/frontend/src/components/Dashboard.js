import { useQuery } from "@apollo/client"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import CourseShowCase from "../components/CourseShowCase"
import { GET_ALL_COURSES } from "../queries/courseQueries"
import { setCourses, courseHasStudent } from '../reducers/courseReducer'
const Dashboard = () =>{
  const user = useSelector((store) => {return store.user})
  const dispatch = useDispatch()
  
  const allCoursesQuery = useQuery(GET_ALL_COURSES)
  const allCourses = useSelector((store) => store.courses)
  const usersCourses = allCourses.filter((course) => courseHasStudent(course, user.username))
  const coursesWhereUserTeaches = allCourses.filter((course) => course.teacher.username === user.username)

  useEffect(() => {
    if(!allCoursesQuery.loading && allCourses.length === 0)
    {
      console.log("set courses due to allCoursesQuery")
      dispatch(setCourses(allCoursesQuery.data.allCourses))
    }
  }, [allCoursesQuery])

  useEffect(() => {
    console.log(allCourses)
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