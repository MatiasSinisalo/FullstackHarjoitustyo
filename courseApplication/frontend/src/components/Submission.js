import { useApolloClient } from "@apollo/client"
import courseService from "../services/courseService"
import { useDispatch } from "react-redux"
import { Notify } from "../reducers/notificationReducer"
import { removeSubmissionFromTask } from "../reducers/courseReducer"


const Submission = ({course, task, submission}) => {
    const client = useApolloClient()
    const dispatch = useDispatch()
    const removeSubmission = async () => {
        await dispatch(removeSubmissionFromTask(course, task, submission, client))
    }

    const isLate = (task, submission) => {
        if(submission?.submittedDate)
        {
            const deadline = new Date(Number(task.deadline))
            const submittedDate = new Date(Number(submission.submittedDate))

            return submittedDate > deadline
        }
        return false
    }

    return(
        <div className={`submission:${submission.id}`}>
        {isLate(task, submission) ? <p>this submission was returned late</p> : <></>}
        <p>{submission.content}</p>
        <p>submitted: {submission.submitted ? <>true</> : <>false</>}</p>
        <button onClick={removeSubmission}>remove</button>
        
        </div>
    )
}

export default Submission