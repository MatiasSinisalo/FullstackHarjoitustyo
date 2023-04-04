import Submission from "./Submission"
import "./styles/course.css"


const AnswersView = ({task}) => {
    return (
        <div className="submissionsListing box">
        <p>answers: </p>
        {
            task.submissions.map((submission) => <Submission key={submission.id} submission={submission}></Submission>)
        }
        </div>
    )
}


export default AnswersView