import { useApolloClient } from "@apollo/client"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
    useParams
} from "react-router-dom"
import { getCourseWithUniqueName, createNewTaskOnCourse } from "../reducers/courseReducer"
import Task from "./Task"




const TeachersCourse = () =>{
  const dispatch = useDispatch()
  const client = useApolloClient()
  const uniqueName = useParams().uniqueName  
  const course = useSelector(store=>store.courses.find((course) => course.uniqueName === uniqueName))
  dispatch(getCourseWithUniqueName(uniqueName, client))
  const createTaskOnThisCourse = async (event) => {
      event.preventDefault()    
      const description = event.target.taskDescription.value
      const deadline = event.target.taskDeadLine.value
      console.log(description)
      console.log(deadline)
      console.log(course)
      await dispatch(createNewTaskOnCourse(course.uniqueName, description, deadline, client))
  }
  
  console.log(course)
  if(!course){
    return (<></>)
  }
  
  return(
    <>
    <h1>{course.uniqueName}</h1>
    <h2>{course.name}</h2>
    <p>this is the teachers course page</p>

    <h2>create a new task on the course</h2>
    <form onSubmit={createTaskOnThisCourse}>
      <p>description</p>
      <input type="text" name="taskDescription"></input>
      <br></br>
      <p>deadline</p>
      <input type="date" name="taskDeadLine"></input>
      <br></br>
      <p></p>
      <input type="submit" value="create task"></input>
    </form>

    <h2>tasks of the course: </h2>
    {course.tasks.length > 0 ? course.tasks.map((task) => <Task task={task} key={task.id}></Task>) : <></>}
    </>

  )
  
}
  
 

export default TeachersCourse