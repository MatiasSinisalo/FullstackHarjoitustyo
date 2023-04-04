import { useDispatch, useSelector } from "react-redux"
import { useApolloClient, useQuery } from "@apollo/client"
import { GET_ALL_COURSES } from "../queries/courseQueries"
import CourseShowCase from "./CourseShowCase"
import { getAllCourses, setCourses } from "../reducers/courseReducer"
import { useEffect } from "react"
const CourseBrowser = () =>{
    const dispatch = useDispatch()
    const client = useApolloClient()
    
    const allCoursesQuery = useQuery(GET_ALL_COURSES)
    if(allCoursesQuery.loading)
    {
      return (<p>loading...</p>)
    }
    const courses = allCoursesQuery.data.allCourses
   
    
    return(
      <>
      <h1>Course Browser page</h1>
      <div className="blueBox">
      {courses.map((course) => <CourseShowCase key={course.uniqueName} course={course}></CourseShowCase>)}
      </div>
      </>
  
    )
}


export default CourseBrowser