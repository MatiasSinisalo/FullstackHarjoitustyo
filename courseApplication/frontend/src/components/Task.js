import SubmitSolutionView from "./SubmitSolutionView"
import AnswersView from "./AnswersView"
import './styles/course.css'
import { useApolloClient, useQuery } from "@apollo/client"
import {ME} from '../queries/userQueries'

import { useDispatch } from "react-redux"
import { Notify } from "../reducers/notificationReducer"
import { removeTaskFromCourse } from "../reducers/courseReducer"
const Task = ({course, task}) => {
    const client = useApolloClient()
    const dispatch = useDispatch()
    const userQuery = useQuery(ME)
    const deadline = new Date(parseInt(task.deadline)).toISOString().split('T')[0]
    const removeTask = async () => {
        await dispatch(removeTaskFromCourse(course, task, client))
    }
    if(userQuery.loading){
        return (
            <p>loading...</p>
        )
    }
    const user = userQuery.data.me
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