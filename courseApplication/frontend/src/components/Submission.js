import { useApolloClient, useQuery } from "@apollo/client"
import courseService from "../services/courseService"
import { useDispatch } from "react-redux"
import { Notify } from "../reducers/notificationReducer"
import { editTaskSubmission, removeSubmissionFromTask } from "../reducers/courseReducer"
import { useState } from "react"
import { ME } from "../queries/userQueries"

const ContentEditView = ({submissionContent, editSubmission, returnSubmission, onContentChange}) => {
    return(
        <>
       
        <textarea cols="100" rows="20" value={submissionContent} onChange={onContentChange}></textarea>
        <br></br>
        <button onClick={editSubmission}>save</button>
        <button onClick={returnSubmission}>return task</button>
       
        </>
    )
}

const Submission = ({course, task, submission}) => {
    const client = useApolloClient()
    const dispatch = useDispatch()
    const [submissionContent, setSubmissionContent] = useState(submission.content)
    const {loading: userLoading, data: userData} = useQuery(ME)
    if(userLoading){
        return(<p>loading...</p>)
    }
    const user = userData.me
    console.log(user)
    
    const removeSubmission = async () => {
        await dispatch(removeSubmissionFromTask(course, task, submission, client))
    }

    const editSubmission = async () => {
        console.log("editing submission")
        await dispatch(editTaskSubmission(course, task.id, submission.id, submissionContent, false, client))
    }

    const returnSubmission = async () =>{
        console.log("editing submission")
        await dispatch(editTaskSubmission(course, task.id, submission.id, submissionContent, true, client))
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
        {user.username === submission.fromUser.username ? 
            <ContentEditView submissionContent={submissionContent} editSubmission={editSubmission} returnSubmission={returnSubmission} onContentChange={updateSubmissionContent}></ContentEditView>
             :
             <textarea cols="100" rows="20" value={submissionContent} readOnly></textarea> 
        } 
       
        <p>submitted: {submission.submitted ? <>true</> : <>false</>}</p>
        <button onClick={removeSubmission}>remove</button>
        
        </div>
    )
}

export default Submission