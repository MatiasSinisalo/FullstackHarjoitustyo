import Submission from "./Submission"



const AnswersView = ({task}) => {
    return (
        <>
        <p>this is where solutions are shown</p>
        {
            task.submissions.map((submission) => <Submission key={submission.id} submission={submission}></Submission>)
        }
        </>
    )
}


export default AnswersView