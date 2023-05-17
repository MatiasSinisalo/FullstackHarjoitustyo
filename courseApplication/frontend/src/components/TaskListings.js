import { useEffect, useState } from "react"
import Task from "./Task"
import './styles/course.css'
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom"
import { useQuery } from "@apollo/client"
import { GET_COURSE } from "../queries/courseQueries"

const TaskShowCase = ({course, task}) => {
  const deadline = new Date(parseInt(task.deadline)).toISOString().split('T')[0]
  return(
    <div className={`task:${task.id} taskShowcase`}>
              <p>{task.description}</p>
              <p>deadline: {deadline}</p>
              <Link to={`/course/${course.uniqueName}/task/${task.id}`}>view</Link>
    </div>
  )
}


const TaskListings = () => {
  const displayModes = {
    future: "future",
    late: "late"
  }
  const [displayMode, setDisplay] = useState(displayModes.future)
  
  const uniqueName = useParams().uniqueName
  const courseQuery = useQuery(GET_COURSE, {variables: {uniqueName}})
  if(courseQuery.loading)
  {
    return(<p>loading...</p>)
  }
  const course = courseQuery.data?.getCourse
  if(!course)
  {
    return(
    <>
    <h1>Whoops</h1>
    <Link to='/dashboard'>it seems like this course doesnt exist, click here to go back to dashboard</Link>
    </>
    )
  }


  const isLate = (task) => {
    const deadline = new Date(parseInt(task.deadline))
    return deadline < Date.now()
  }
  const futureTasks = course.tasks.filter((task) => !isLate(task))
  const lateTasks = course.tasks.filter((task) => isLate(task))
  
  const updateDisplay = (event) => {
    setDisplay(event.target.value)
  }
  
  return(
    
    <div className="taskListing blueBox">
    
    <h2>tasks of the course: </h2>
    
    <label htmlFor="task-select">Show task: </label>
    <select name="taskSelect" id="task-select" onChange={updateDisplay}>
        <option value={displayModes.future}>future</option>
        <option value={displayModes.past}>past</option>
    </select> 
    
    {
      displayMode == displayModes.future 
      ?
        futureTasks.map((task) => <TaskShowCase course = {course} task={task} key={task.id}></TaskShowCase>)
      :
        lateTasks.map((task) => <TaskShowCase course = {course} task={task} key={task.id}></TaskShowCase>)
    }
    </div>
  )
}

export default TaskListings