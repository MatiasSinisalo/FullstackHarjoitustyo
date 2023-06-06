import { useApolloClient, useQuery } from "@apollo/client"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  Link,
  Navigate,
  Outlet,
  redirect,
  useNavigate,
    useParams
} from "react-router-dom"
import { GET_COURSE } from "../queries/courseQueries"
import courseService from "../services/courseService"
import Task from "./Task"
import { Notify } from "../reducers/notificationReducer"
import TaskListings from "./TaskListings"
import "./styles/course.css"
import { createNewTaskOnCourse, removeCourse, removeStudentFromCourse } from "../reducers/courseReducer"
import CourseParticipants from "./CourseParticipants"
import { ME } from "../queries/userQueries"


export const TaskCreationForm = ({course}) => {
  const dispatch = useDispatch()
  const client = useApolloClient()
  
  const createTaskOnThisCourse = async (event) => {
    event.preventDefault()    
    const description = event.target.taskDescription.value
    const deadline = event.target.taskDeadLine.value
    const maxGrade = Number(event.target.taskMaxGrade?.value)
    console.log(maxGrade)
    await dispatch(createNewTaskOnCourse(course.uniqueName, description, deadline, maxGrade, client))
}

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
        <p>max grade</p>
        <input type="number" name="taskMaxGrade"></input>
        <p></p>
        <input type="submit" value="create task"></input>
      </form>
    </div>
  )
}


const TeachersCourse = ({course}) =>{
  const dispatch = useDispatch()
  const client = useApolloClient()
  const navigate = useNavigate()

  const userQuery = useQuery(ME)
  if(userQuery.loading)
  {
    return(<p>loading...</p>)
  }
  const user = userQuery.data.me
  if(!(user.username === course.teacher.username)){
    return (<Navigate to={`/course/${course.uniqueName}`} />)
  }
  
  const removeThisCourse = async() =>{
    await dispatch(removeCourse(course, client, navigate))
  }

  return(
    <div className="course">
    <h1>this is the teachers view</h1>
    <h2><button className="removeCourseButton" onClick={removeThisCourse}>remove course</button></h2>
    <div className="blueBox">
      <Link to="participants">see course participants</Link>
      <br></br>
      <Link to="newTask">create new task</Link>
      <br></br>
      <Link to="newInfoPage">create new info page</Link>
    </div>
    <Outlet></Outlet>
    </div>
    
  )
  
}
  
 

export default TeachersCourse