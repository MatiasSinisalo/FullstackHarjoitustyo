import { useEffect, useState } from "react"
import Task from "./Task"
import './styles/course.css'
import { Link, useNavigate } from "react-router-dom"

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


const TaskListings = ({course}) => {
  
  const isLate = (task) => {
    const deadline = new Date(parseInt(task.deadline))
    return deadline < Date.now()
  }
  const futureTasks = course.tasks.filter((task) => !isLate(task))
  const lateTasks = course.tasks.filter((task) => isLate(task))
  
  const displayModes = {
    future: "future",
    late: "late"
  }
  const [displayMode, setDisplay] = useState(displayModes.future)
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