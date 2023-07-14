import { useApolloClient } from "@apollo/client"
import courseService from "../../services/courseService"
import { useDispatch } from "react-redux"
import { Notify } from "../../reducers/notificationReducer"
import { addSubmissionToTask } from "../../reducers/courseReducer"
import { useNavigate } from "react-router-dom"


const SubmitSolutionView = ({course, task, user}) => {
    const apolloClient = useApolloClient()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const usersAnswer = task.submissions.find((sub) => sub.fromUser.username === user.username)
    const submitSolution = async (event) => {
        event.preventDefault()
        const content = ""
        const submission = await addSubmissionToTask(course, task, content, apolloClient)
        if(submission)
        {
            navigate(`submission/${submission.id}`)
        }
    }
    if(!usersAnswer)
    {
        return (
            <div className="container primary">
                <p>please answer below:</p>
                <form onSubmit={submitSolution}>
                    <input className="action-button" type="submit" value="create new solution"></input>
                </form>
            </div>
        )
    }
    else{
        return(
                <div className="container primary">
                    <button className="action-button" onClick={() => navigate(`submission/${usersAnswer.id}`)}>view answer</button>
                </div>
        )
    }
}


export default SubmitSolutionView