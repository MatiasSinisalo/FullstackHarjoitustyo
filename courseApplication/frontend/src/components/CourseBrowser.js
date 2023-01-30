import { useSelector } from "react-redux"
import CourseShowCase from "./CourseShowCase"
const CourseBrowser = () =>{
    const courses = useSelector((store) => store.courses)
    return(
      <>
      <p>Course Browser page</p>

      {courses.map((course) => <CourseShowCase key={course.uniqueName} course={course}></CourseShowCase>)}
      </>
  
    )
}


export default CourseBrowser