import { useSelector } from "react-redux"
import {
    useParams
} from "react-router-dom"


  
const Course = ({courses}) =>{
  const uniqueName = useParams().uniqueName
  console.log(uniqueName)
  
  const course = useSelector((store) => store.courses.find((course) => course.uniqueName === uniqueName))
  return(
    <>
    <h1>{course.uniqueName}</h1>
    <h2>{course.name}</h2>
    <p>single course page</p>
    </>

  )
}
  
 

export default Course