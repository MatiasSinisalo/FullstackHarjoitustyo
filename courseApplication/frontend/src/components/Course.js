import { useSelector } from "react-redux"
import {
    useParams
} from "react-router-dom"
import Task from "./Task"





const Course = () =>{
  const uniqueName = useParams().uniqueName  
  const course = useSelector((store) => store.courses.find((course) => course.uniqueName === uniqueName))
  console.log(course)
  return(
    <>
    <h1>{course.uniqueName}</h1>
    <h2>{course.name}</h2>
    <p>single course page</p>
    {course.tasks.map((task) => <Task task={task} key={task.id}></Task>)}
    </>

  )
}
  
 

export default Course