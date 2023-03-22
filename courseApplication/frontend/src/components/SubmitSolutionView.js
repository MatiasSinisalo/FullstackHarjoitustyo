import { useApolloClient } from "@apollo/client"
import courseService from "../services/courseService"



const SubmitSolutionView = ({course, task}) => {
    const apolloClient = useApolloClient()
    const submitSolution = async (event) => {
        event.preventDefault()
        const content = event.target.content.value
        console.log("creating a submission to task!")
        await courseService.addSubmissionToCourseTask(course.uniqueName, task.id, content, true, apolloClient)
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