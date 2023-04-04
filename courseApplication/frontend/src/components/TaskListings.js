import Task from "./Task"
import './styles/course.css'
const TaskListings = ({course}) => {
    return(
      <div className="taskListing blueBox">
      <h2>tasks of the course: </h2>
      {course.tasks.length > 0 ? course.tasks.map((task) => <Task course = {course} task={task} key={task.id}></Task>) : <></>}
      </div>
    )
  }

export default TaskListings