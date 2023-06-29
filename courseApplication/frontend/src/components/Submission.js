import { useApolloClient, useQuery } from "@apollo/client"
import courseService from "../services/courseService"
import { useDispatch } from "react-redux"
import { Notify } from "../reducers/notificationReducer"
import { editTaskSubmission, gradeSubmission, removeSubmissionFromTask } from "../reducers/courseReducer"
import { useState } from "react"
import { ME } from "../queries/userQueries"
import { Link, useNavigate, useParams } from "react-router-dom"



const Submission = ({course, task}) => {
    const client = useApolloClient()
    const dispatch = useDispatch()
    const submissionId = useParams().submissionId
    const submission = task.submissions.find((s) => s.id === submissionId)
    const [submissionContent, setSubmissionContent] = useState(submission?.content)
   
    const {loading: userLoading, data: userData} = useQuery(ME)
    if(userLoading){
        return(<p>loading...</p>)
    }
    const user = userData.me
    
    const removeSubmission = async () => {
        await dispatch(removeSubmissionFromTask(course, task, submission, client))
    }

    const editSubmission = async () => {
      
        await dispatch(editTaskSubmission(course, task.id, submission.id, submissionContent, false, client))
    }

    const returnSubmission = async () =>{
     
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

    if(!submission){
        return(
            <>
                <Link to={`/course/${course.uniqueName}/task/${task.id}`}>it seems like this submission doesnt exist, click here to go to task</Link>
            </>
            )
    }
    return(
        <div className={`submission:${submission.id} container primary`}>
            {isLate(task, submission) ? <p className="lateMessage">this submission was returned late</p> : <></>}
            {user.username === submission.fromUser.username ? 
                <ContentEditView submitted={submission.submitted} submissionContent={submissionContent} editSubmission={editSubmission} returnSubmission={returnSubmission} onContentChange={updateSubmissionContent}></ContentEditView>
                :
                <textarea name="content" cols="100" rows="20" value={submissionContent} placeholder="this is an empty answer" readOnly></textarea> 
            } 
        
            <p>submitted: {submission.submitted ? <>true</> : <>false</>}</p>
            
            <button className="dangerous-button" onClick={removeSubmission}>remove</button>
            {(submission.submitted  && user.username ===  course.teacher.username) ? <SubmissionGradeForm course={course} task={task} submission={submission}></SubmissionGradeForm> : <></>}
            {submission?.grade ? <SubmissionGradeDisplay points={submission?.grade.points} date={submission?.grade.date} maxGrade={task?.maxGrade}></SubmissionGradeDisplay> : <></>}
        </div>
    )
}

const SubmissionGradeDisplay = ({points, date, maxGrade}) => {
    const dateString = new Date(Number(date)).toISOString().split('T')[0]
    return(
        <>
        <p>this answer got grade: {points} {maxGrade ?  `/${maxGrade}` : <></>}</p>
        <p>date of grading: {dateString}</p>
        </>
    )
}

const SubmissionGradeForm = ({course, task, submission}) => {
    const dispatch = useDispatch()
    const client = useApolloClient()
    const submitGrade = async (event) => {
        event.preventDefault()
       
        const grade = event.target.points.value
        await dispatch(gradeSubmission(course.uniqueName, task.id, submission.id, Number(grade), client))
    }

    return(
        <>
        <p>this task can be graded: </p>
        <form onSubmit={submitGrade}>
            <input type="number" name="points"></input>
            <input className="action-button" type="submit" value="submit grade"></input>
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
                <button className="action-button" onClick={editSubmission}>save</button>
                <button className="action-button" onClick={returnSubmission}>return task</button>
            </>
            :
            <></>
        }
       
       
        </>
    )
}

export default Submission