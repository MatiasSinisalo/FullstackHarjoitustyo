


const SubmitSolutionView = ({task}) => {

    const submitSolution = (event) => {
        event.preventDefault()
        console.log("creating a submission to task!")
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