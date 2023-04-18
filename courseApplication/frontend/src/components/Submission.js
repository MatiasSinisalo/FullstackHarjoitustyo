import { useApolloClient } from "@apollo/client"
import courseService from "../services/courseService"


const Submission = ({course, task, submission}) => {
    const client = useApolloClient()
    const removeSubmission = async () => {
        console.log("removed submission")

        const removed = await courseService.removeSubmissionFromCourseTask(course.uniqueName, task.id, submission.id, client)
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