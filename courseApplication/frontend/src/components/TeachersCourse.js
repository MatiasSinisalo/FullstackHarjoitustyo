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


const TaskCreationForm = () => {
  const dispatch = useDispatch()
  const client = useApolloClient()
  const uniqueName = useParams().uniqueName
  
  //check if this course exists, just in case the user typed in a wrong url
  const courseQuery = useQuery(GET_COURSE, {variables: {uniqueName}})
  if(courseQuery.loading){
    return(
      <p>loading...</p>
    )
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
   
    await dispatch(createNewTaskOnCourse(uniqueName, description, deadline, client))
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
  const userQuery = useQuery(ME)
  if(courseQuery.loading || userQuery.loading)
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
    </div>
    <Outlet></Outlet>
    <TaskCreationForm></TaskCreationForm>
    </div>
    
  )
  
}
  
 

export default TeachersCourse