import { useApolloClient } from "@apollo/client"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
    useParams
} from "react-router-dom"
import { getCourseWithUniqueName } from "../reducers/courseReducer"
import Task from "./Task"





const TeachersCourse = () =>{
  const dispatch = useDispatch()
  const client = useApolloClient()
  const uniqueName = useParams().uniqueName  
  
  const [course, setCourse] = useState()
  dispatch(getCourseWithUniqueName(uniqueName, client)).then((result) => setCourse(result))
 
  
  
  console.log(course)
  if(!course){
    return (<></>)
  }
  
  return(
    <>
    <h1>{course.uniqueName}</h1>
    <h2>{course.name}</h2>
    <p>this is the teachers course page</p>
    {course.tasks.length > 0 ? course.tasks.map((task) => <Task task={task} key={task.id}></Task>) : <></>}
    </>

  )
  
}
  
 

export default TeachersCourse