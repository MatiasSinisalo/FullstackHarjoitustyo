import { useState } from "react"
import Task from "./Task"
import './styles/course.css'
const TaskListings = ({course}) => {
  
 
  
  const isLate = (task) => {
    console.log(task)
    const deadline = new Date(parseInt(task.deadline))
    return deadline < Date.now()
  }
  const futureTasks = course.tasks.filter((task) => !isLate(task))
  const lateTasks = course.tasks.filter((task) => isLate(task))
  
  const [displayedTasks, setDisplayedTasks] = useState([])

  return(
    <div className="taskListing blueBox">
    <h2>tasks of the course: </h2>
    <button onClick={() => setDisplayedTasks(lateTasks)}>show past tasks</button>
    <button onClick={() => setDisplayedTasks(futureTasks)}>show future tasks</button>
    {displayedTasks.map((task) => <Task course = {course} task={task} key={task.id}></Task>)}
    </div>
  )
}

export default TaskListings