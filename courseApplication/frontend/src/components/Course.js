import {
    useParams
} from "react-router-dom"


  
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
  
 

export default Course