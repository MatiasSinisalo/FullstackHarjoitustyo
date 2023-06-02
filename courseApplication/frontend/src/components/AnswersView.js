import { useNavigate } from "react-router-dom"
import Submission from "./Submission"
import "./styles/course.css"


const AnswersView = ({course, task}) => {
    return (
        <div className="submissionsListing box">
        <p>answers: </p>
        <table>
            <thead>
                <tr>
                    <th>username</th>
                    <th>submitted</th>
                    <th>submission</th>
                </tr>
            </thead>
            <tbody>
                {task.submissions.map((submission) => <SubmissionShowCase  key={submission.id} course = {course} task={task} submission={submission}></SubmissionShowCase>)}
            </tbody>
            </table>
        </div>
    )
}

const SubmissionShowCase = ({course, task, submission}) => {
    const navigate = useNavigate()
    const submittedDate = submission.submitted ? new Date(Number(submission.submittedDate)).toISOString().split("T")[0] : 'not submitted'
    return (
        <tr className={`submissionShowCase:${submission.id}`}>
            <td>{submission.fromUser.username}</td>
            <td>{submittedDate}</td>
            <td><button onClick={() => {navigate(`submission/${submission.id}`)}}>view</button></td>
        </tr>
    )
}

export default AnswersView