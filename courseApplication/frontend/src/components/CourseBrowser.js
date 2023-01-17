import { useSelector } from "react-redux"
const CourseBrowser = () =>{
    const courses = useSelector((store) => store.courses)
    return(
      <>
      <p>Course Browser page</p>

      {courses.map((course) => <p key={course.uniqueName}>{course.uniqueName} {course.name}</p>)}
      </>
  
    )
}


export default CourseBrowser