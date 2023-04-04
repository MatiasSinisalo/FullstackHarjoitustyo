import { useApolloClient, useQuery } from "@apollo/client"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  Link,
  useNavigate,
    useParams
} from "react-router-dom"
import { GET_COURSE } from "../queries/courseQueries"
import courseService from "../services/courseService"
import Task from "./Task"
import { Notify } from "../reducers/notificationReducer"
import TaskListings from "./TaskListings"
import "./styles/course.css"



const TaskCreationForm = ({createTaskOnThisCourse}) => {
  return (
    <div className="blueBox">
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
    </div>
  )
}


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
  
  const course = courseQuery.data?.getCourse
  if(!course)
  {
    return(<>
    <h1>Whoops</h1>
    <Link to='/dashboard'>it seems like this course doesnt exist, click here to go back to dashboard</Link>
    </>)
  }

  const createTaskOnThisCourse = async (event) => {
      event.preventDefault()    
      const description = event.target.taskDescription.value
      const deadline = event.target.taskDeadLine.value
      console.log(description)
      console.log(deadline)
      console.log(course)
      const addedTask = await courseService.addTaskToCourse(uniqueName, description, deadline, client)
      if(addedTask.description){
        dispatch(Notify(`successfully created task`, "successNotification", 5))
      }
      else{
        dispatch(Notify(`${addedTask.message}`, "errorNotification", 5))
      }
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
    <div className="course">
    <h1>this is the teachers course page</h1>
    <h2>{course.uniqueName} <button className="removeCourseButton" onClick={removeThisCourse}>remove</button></h2>
    <h3>{course.name}</h3>
   
    
    
    <TaskCreationForm createTaskOnThisCourse={createTaskOnThisCourse}></TaskCreationForm>

    <TaskListings course={course}></TaskListings>
    
    </div>

  )
  
}
  
 

export default TeachersCourse