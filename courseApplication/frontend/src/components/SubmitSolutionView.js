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
        const content = event.target.content.value
        await dispatch(addSubmissionToTask(course, task, content, apolloClient))
    }
    return (
        <div>
            <p>please answer below:</p>
            <form onSubmit={submitSolution}>
                <input name="content" type="text"></input>
                <br></br>
                <input type="submit" value="submit solution"></input>
            </form>
        </div>
    )
}


export default SubmitSolutionView