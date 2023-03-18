


const AnswersView = ({task}) => {
    return (
        <>
        <p>this is where solutions are shown</p>
        {
            task.submissions.map((submission) => <p key={submission.id}>{submission.content}</p>)
        }
        </>
    )
}


export default AnswersView