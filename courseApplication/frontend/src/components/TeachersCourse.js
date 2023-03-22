import { useApolloClient, useQuery } from "@apollo/client"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  useNavigate,
    useParams
} from "react-router-dom"
import { GET_COURSE } from "../queries/courseQueries"
import courseService from "../services/courseService"
import Task from "./Task"




const TeachersCourse = () =>{
  const dispatch = useDispatch()
  const client = useApolloClient()
  const navigate = useNavigate()
  const uniqueName = useParams().uniqueName

  const courseQuery = useQuery(GET_COURSE, {variables: {uniqueName}})
  if(courseQuery.loading)
  {
    return(<p>loading...</p>)
  }
  const course = courseQuery.data.getCourse

  const createTaskOnThisCourse = async (event) => {
      event.preventDefault()    
      const description = event.target.taskDescription.value
      const deadline = event.target.taskDeadLine.value
      console.log(description)
      console.log(deadline)
      console.log(course)
      await courseService.addTaskToCourse(uniqueName, description, deadline, client)
  }
  
  const removeThisCourse = async() =>{
    const prompt = window.prompt(`type ${course.uniqueName} to confirm removal`)
    if(prompt === course.uniqueName)
    {
      console.log("removing course")
      const removed = await courseService.removeCourse(course, client)
      if(removed){
        navigate('/dashboard')
      }
    }
  }


  console.log(course)
  if(!course){
    return (<></>)
  }
  
  return(
    <>
    <h1>{course.uniqueName} <button onClick={removeThisCourse}>remove</button></h1>
    <h2>{course.name}</h2>
    <p>this is the teachers course page</p>
    
    
    <h3>create a new task on the course</h3>
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
    {course.tasks.length > 0 ? course.tasks.map((task) => <Task course = {course} task={task} key={task.id}></Task>) : <></>}
    </>

  )
  
}
  
 

export default TeachersCourse