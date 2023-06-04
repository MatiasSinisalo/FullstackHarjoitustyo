import SubmitSolutionView from "./SubmitSolutionView"
import AnswersView from "./AnswersView"
import './styles/course.css'
import { useApolloClient, useQuery } from "@apollo/client"
import {ME} from '../queries/userQueries'

import { useDispatch } from "react-redux"
import { Notify } from "../reducers/notificationReducer"
import { removeTaskFromCourse } from "../reducers/courseReducer"
import { Link, useParams } from "react-router-dom"
import { GET_COURSE } from "../queries/courseQueries"
const Task = ({course}) => {
    const client = useApolloClient()
    const dispatch = useDispatch()
    const taskId = useParams().taskId
    const userQuery = useQuery(ME)
    if(userQuery.loading)
    {
      return(<p>loading...</p>)
    }

  
    const user = userQuery.data.me
    const task = course.tasks.find((task) => task.id === taskId)
    
    if(!task){
        return (
            <>
            <Link to={`/course/${course.uniqueName}/tasks`}>it seems like this task doesnt exist, click here to go back to course tasks</Link>
            </>
        )
    }
    
    const deadline = new Date(parseInt(task.deadline)).toISOString().split('T')[0]
    
  
    const removeTask = async () => {
        await dispatch(removeTaskFromCourse(course, task, client))
    }

    return (
        <div className={`task:${task.id} task`}>
            <Link to={`/course/${course.uniqueName}/tasks`}>back to tasks</Link> 
            <p>{task.description}</p>
            <p>deadline: {deadline}</p>
            {task?.maxGrade ? <p>max grade: {task?.maxGrade}</p> : <></>}
            {user.username === course.teacher.username ? <button onClick={removeTask}>remove task</button> : <></>}
            <SubmitSolutionView course={course} task={task}></SubmitSolutionView>
            <AnswersView course={course} task={task}></AnswersView>
        
        </div>
    )
}

export default Task