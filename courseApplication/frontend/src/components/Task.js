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
const Task = () => {
    const client = useApolloClient()
    const dispatch = useDispatch()
    const userQuery = useQuery(ME)

    const uniqueName = useParams().uniqueName
    const taskId = useParams().taskId
    console.log(taskId)
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
    
    if(userQuery.loading){
        return (
            <p>loading...</p>
        )
    }
    const user = userQuery.data.me

    const task = course.tasks.find((task) => task.id === taskId)
    if(!task){
        return (
            <>
            <h1>Whoops</h1>
            <Link to='/dashboard'>it seems like this task doesnt exist, click here to go back to dashboard</Link>
            </>
        )
    }
    const deadline = new Date(parseInt(task.deadline)).toISOString().split('T')[0]
    const removeTask = async () => {
        await dispatch(removeTaskFromCourse(course, task, client))
    }


    return (
        <div className={`task:${task.id} task`}>
            <p>{task.description}</p>
            <p>deadline: {deadline}</p>
            {user.username === course.teacher.username ? <button onClick={removeTask}>remove task</button> : <></>}
            <SubmitSolutionView course={course} task={task}></SubmitSolutionView>
            <AnswersView course={course} task={task}></AnswersView>
        
        </div>
    )
}

export default Task