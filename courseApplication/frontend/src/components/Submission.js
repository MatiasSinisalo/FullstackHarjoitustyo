import { useApolloClient, useQuery } from "@apollo/client"
import courseService from "../services/courseService"
import { useDispatch } from "react-redux"
import { Notify } from "../reducers/notificationReducer"
import { editTaskSubmission, removeSubmissionFromTask } from "../reducers/courseReducer"
import { useState } from "react"
import { ME } from "../queries/userQueries"
import { useNavigate } from "react-router-dom"



const Submission = ({course, task, submission}) => {
    const client = useApolloClient()
    const dispatch = useDispatch()
    const [submissionContent, setSubmissionContent] = useState(submission.content)
    const {loading: userLoading, data: userData} = useQuery(ME)
    const navigate = useNavigate()
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
            <ContentEditView submitted={submission.submitted} submissionContent={submissionContent} editSubmission={editSubmission} returnSubmission={returnSubmission} onContentChange={updateSubmissionContent}></ContentEditView>
             :
             <textarea name="content" cols="100" rows="20" value={submissionContent} placeholder="this is an empty answer" readOnly></textarea> 
        } 
       
        <p>submitted: {submission.submitted ? <>true</> : <>false</>}</p>

        <button onClick={removeSubmission}>remove</button>
        {(submission.submitted  && user.username ===  course.teacher.username) ? <SubmissionGradeForm course={course} task={task} submission={submission}></SubmissionGradeForm> : <></>}
        </div>
    )
}

const SubmissionGradeForm = ({course, task, submission}) => {
    const submitGrade = (event) => {
        event.preventDefault()
        console.log("grading submission")
        console.log(event.target.points.value)
    }

    return(
        <>
        <p>this task can be graded: </p>
        <form onSubmit={submitGrade}>
            <input type="number" name="points"></input>
            <input type="submit" value="submit grade"></input>
        </form>
        </>
    )
}


const ContentEditView = ({submitted, submissionContent, editSubmission, returnSubmission, onContentChange}) => {
    return(
        <>
        {
            !submitted ? 
            <textarea name="content" cols="100" rows="20" placeholder="this is an empty answer" value={submissionContent} onChange={onContentChange}></textarea>
            :
            <textarea name="content" cols="100" rows="20" placeholder="this is an empty answer" value={submissionContent} readOnly></textarea>
        }
        <br></br>
        {
            !submitted?
            <>
                <button onClick={editSubmission}>save</button>
                <button onClick={returnSubmission}>return task</button>
            </>
            :
            <></>
        }
       
       
        </>
    )
}

export default Submission