import {
    useParams
} from "react-router-dom"

const CourseBrowser = () =>{
    return(
      <>
      <p>Course Browser page</p>
      </>
  
    )
  }
  
  const Course = ({courses}) =>{
    const id = Number(useParams().id)
    const course = courses.find(course => course.id === id)
    return(
      <>
      <h1>{course.name}</h1>
      <p>single course page</p>
      </>
  
    )
  }
  
  const CreateCourse = () =>{
     return(
      <>
      <p>Create course page</p>
      </>
  
    )
  }

export {CourseBrowser, CreateCourse, Course}