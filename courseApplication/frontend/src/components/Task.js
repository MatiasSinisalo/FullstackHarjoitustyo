import SubmitSolutionView from "./SubmitSolutionView"
import AnswersView from "./AnswersView"
import './styles/course.css'
import { useApolloClient, useQuery } from "@apollo/client"
import {ME} from '../queries/userQueries'
import courseService from "../services/courseService"
const Task = ({course, task}) => {
    const client = useApolloClient()
    const userQuery = useQuery(ME)
    const deadline = new Date(parseInt(task.deadline)).toISOString().split('T')[0]
    const removeTask = async () => {
        console.log("removing task")
        await courseService.removeTaskFromCourse(course.uniqueName, task.id, client);
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
            <AnswersView task={task}></AnswersView>
        
        </div>
    )
}

export default Task