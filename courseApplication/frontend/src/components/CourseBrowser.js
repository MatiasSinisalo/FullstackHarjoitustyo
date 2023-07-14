import { useDispatch, useSelector } from "react-redux"
import { useApolloClient, useQuery } from "@apollo/client"
import { GET_ALL_COURSES } from "../queries/courseQueries"
import CourseShowCase from "./course/CourseShowCase"
import { getAllCourses, setCourses } from "../reducers/courseReducer"
import { useEffect } from "react"
import { ME } from "../queries/userQueries"
const CourseBrowser = () =>{
    const dispatch = useDispatch()
    const client = useApolloClient()
    
    const userQuery = useQuery(ME)
    
    const allCoursesQuery = useQuery(GET_ALL_COURSES)
    if(allCoursesQuery.loading || userQuery.loading)
    {
      return (<p>loading...</p>)
    }
    const courses = allCoursesQuery.data.allCourses
    const user = userQuery.data.me
    
    return(
      <div className="container">
        
        <div className="container ">
          <h1>Course Browser page</h1>
          {courses.map((course) => <CourseShowCase key={course.uniqueName} currentUser={user} course={course}></CourseShowCase>)}
        </div>
      </div>
  
    )
}


export default CourseBrowser