import { useApolloClient, useQuery } from "@apollo/client"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import CourseShowCase from "../components/CourseShowCase"
import { GET_ALL_COURSES } from "../queries/courseQueries"
import { ME } from "../queries/userQueries"
import { courseHasStudent } from '../reducers/courseReducer'
import courseService from "../services/courseService"
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