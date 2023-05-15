import { useState } from "react"
import Task from "./Task"
import './styles/course.css'
const TaskListings = ({course}) => {
    const isLate = (task) => {
        const deadline = new Date(parseInt(task.deadline))
        return deadline < Date.now()
    }

    return(
      <div className="taskListing blueBox">
      <h2>tasks of the course: </h2>
      <button>show late tasks</button>
      <button>show future tasks</button>
      {course.tasks.map((task) => isLate(task)? <></> : <Task course = {course} task={task} key={task.id}></Task>)}
      </div>
    )
  }

export default TaskListings