import { useDispatch, useSelector } from "react-redux"
import { useQuery } from "@apollo/client"
import { GET_ALL_COURSES } from "../queries/courseQueries"
import CourseShowCase from "./CourseShowCase"
import { setCourses } from "../reducers/courseReducer"
import { useEffect } from "react"
const CourseBrowser = () =>{
    const dispatch = useDispatch()
    const allCoursesQuery = useQuery(GET_ALL_COURSES)
    
    const courses = useSelector((store) => store.courses)
    useEffect(() => {
      if(!allCoursesQuery.loading && courses.length === 0)
      {
        console.log("set courses due to allCoursesQuery")
        dispatch(setCourses(allCoursesQuery.data.allCourses))
      }
    }, [allCoursesQuery])
    
    return(
      <>
      <p>Course Browser page</p>

      {courses.map((course) => <CourseShowCase key={course.uniqueName} course={course}></CourseShowCase>)}
      </>
  
    )
}


export default CourseBrowser