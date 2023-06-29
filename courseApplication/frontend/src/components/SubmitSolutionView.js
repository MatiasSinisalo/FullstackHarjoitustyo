import { useApolloClient } from "@apollo/client"
import courseService from "../services/courseService"
import { useDispatch } from "react-redux"
import { Notify } from "../reducers/notificationReducer"
import { addSubmissionToTask } from "../reducers/courseReducer"


const SubmitSolutionView = ({course, task}) => {
    const apolloClient = useApolloClient()
    const dispatch = useDispatch()
    const submitSolution = async (event) => {
        event.preventDefault()
        const content = ""
        await dispatch(addSubmissionToTask(course, task, content, apolloClient))
    }
    return (
        <div className="container primary">
            <p>please answer below:</p>
            <form onSubmit={submitSolution}>
                <input className="action-button" type="submit" value="create new solution"></input>
            </form>
        </div>
    )
}


export default SubmitSolutionView