

const Submission = ({submission}) => {
    return(
        <div className={`submission:${submission.id}`}>
        <p>{submission.content}</p>
        <p>submitted: {submission.submitted ? <>true</> : <>false</>}</p>
        </div>
    )
}

export default Submission