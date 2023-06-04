import { Link, useParams } from "react-router-dom"
import Submission from "./Submission"
import { useQuery } from "@apollo/client"
import { GET_COURSE } from "../queries/courseQueries"



const SubmissionPage = ({course}) => {
    const taskId = useParams().taskId
    const submissionId = useParams().submissionId
    
    const task = course.tasks.find((t) => t.id === taskId)
    if(!task){
        return(
        <>
             <Link to={`/course/${course.uniqueName}`}>it seems like this submission doesnt exist, click here to go to course page</Link>
        </>
        )
    }
    const submission = task.submissions.find((s) => s.id === submissionId)
    if(!submission){
        return(
            <>
                <Link to={`/course/${course.uniqueName}/task/${task.id}`}>it seems like this submission doesnt exist, click here to go to task</Link>
            </>
            )
    }
    return(
        <>
            <Submission course={course} task={task} submission={submission}></Submission>
        </>
    )
}

export default SubmissionPage