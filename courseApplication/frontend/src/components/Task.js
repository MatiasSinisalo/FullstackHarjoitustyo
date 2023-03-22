import SubmitSolutionView from "./SubmitSolutionView"
import AnswersView from "./AnswersView"


const Task = ({course, task}) => {
    const deadline = new Date(parseInt(task.deadline)).toISOString().split('T')[0]
    return (
        <div className={`task:${task.id}`}>
            <p>{task.description}</p>
            <p>deadline: {deadline}</p>
            <SubmitSolutionView course={course} task={task}></SubmitSolutionView>
            <AnswersView task={task}></AnswersView>
        </div>
    )
}

export default Task