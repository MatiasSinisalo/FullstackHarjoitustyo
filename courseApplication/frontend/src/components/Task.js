import SubmitSolutionView from "./SubmitSolutionView"



const Task = ({task}) => {
    const deadline = new Date(parseInt(task.deadline)).toISOString().split('T')[0]
    return (
        <div className={`task:${task.id}`}>
            <p>{task.description}</p>
            <p>deadline: {deadline}</p>
            <SubmitSolutionView task={task}></SubmitSolutionView>
        </div>
    )
}

export default Task