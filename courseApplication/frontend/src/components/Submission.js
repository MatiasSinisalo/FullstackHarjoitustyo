import { useApolloClient } from "@apollo/client"
import courseService from "../services/courseService"
import { useDispatch } from "react-redux"
import { Notify } from "../reducers/notificationReducer"


const Submission = ({course, task, submission}) => {
    const client = useApolloClient()
    const dispatch = useDispatch()
    const removeSubmission = async () => {
        console.log("removed submission")

        const removed = await courseService.removeSubmissionFromCourseTask(course.uniqueName, task.id, submission.id, client)
        if(!removed.error){
            dispatch(Notify("successfully removed submission", "successNotification", 3))
        }
        else{
            dispatch(Notify(removed.error.message, "errorNotification", 3))
        }
        console.log(removed)

    }
    return(
        <div className={`submission:${submission.id}`}>
        <p>{submission.content}</p>
        <p>submitted: {submission.submitted ? <>true</> : <>false</>}</p>
        <button onClick={removeSubmission}>remove</button>
        </div>
    )
}

export default Submission