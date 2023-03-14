import { useDispatch, useSelector } from "react-redux"
import { useApolloClient, useQuery } from "@apollo/client"
import { GET_ALL_COURSES } from "../queries/courseQueries"
import CourseShowCase from "./CourseShowCase"
import { getAllCourses, setCourses } from "../reducers/courseReducer"
import { useEffect } from "react"
const CourseBrowser = () =>{
    const dispatch = useDispatch()
    const client = useApolloClient()
    dispatch(getAllCourses(client))
    const courses = useSelector((store) => store.courses)
   
    
    return(
      <>
      <p>Course Browser page</p>

      {courses.map((course) => <CourseShowCase key={course.uniqueName} course={course}></CourseShowCase>)}
      </>
  
    )
}


export default CourseBrowser