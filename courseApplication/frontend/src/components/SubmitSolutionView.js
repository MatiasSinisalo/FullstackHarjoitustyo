import { useApolloClient } from "@apollo/client"
import courseService from "../services/courseService"
import { useDispatch } from "react-redux"
import { Notify } from "../reducers/notificationReducer"


const SubmitSolutionView = ({course, task}) => {
    const apolloClient = useApolloClient()
    const dispatch = useDispatch()
    const submitSolution = async (event) => {
        event.preventDefault()
        const content = event.target.content.value
        console.log("creating a submission to task!")
        const createdSolutionQuery = await courseService.addSubmissionToCourseTask(course.uniqueName, task.id, content, true, apolloClient)
        if(createdSolutionQuery.id){
            dispatch(Notify(`successfully answered to task`, "successNotification", 5))
        }
        else{
            dispatch(Notify(`${createdSolutionQuery.message}`, "errorNotification", 5))
        }
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