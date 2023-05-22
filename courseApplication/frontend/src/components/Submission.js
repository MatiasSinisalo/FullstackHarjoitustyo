import { useApolloClient } from "@apollo/client"
import courseService from "../services/courseService"
import { useDispatch } from "react-redux"
import { Notify } from "../reducers/notificationReducer"
import { removeSubmissionFromTask } from "../reducers/courseReducer"
import { useState } from "react"


const Submission = ({course, task, submission}) => {
    const client = useApolloClient()
    const dispatch = useDispatch()
    const [submissionContent, setSubmissionContent] = useState(submission.content)
    const removeSubmission = async () => {
        await dispatch(removeSubmissionFromTask(course, task, submission, client))
    }

    const editSubmission = async () => {
        console.log("editing submission")
    }

    const updateSubmissionContent = (event) => {
        console.log(event.target.value)
        setSubmissionContent(event.target.value)
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
        {isLate(task, submission) ? <p className="lateMessage">this submission was returned late</p> : <></>}
        <textarea value={submissionContent} onChange={updateSubmissionContent}></textarea>
        <br></br>
        <button onClick={editSubmission}>save</button>
       
        <p>submitted: {submission.submitted ? <>true</> : <>false</>}</p>
        <button onClick={removeSubmission}>remove</button>
        
        </div>
    )
}

export default Submission