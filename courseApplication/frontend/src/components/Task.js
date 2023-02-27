


const Task = ({task}) => {
    const deadline = new Date(parseInt(task.deadline)).toString()
    return (
        <div>
            <p>{task.description}</p>
            <p>deadline: {deadline}</p>
            <button>submit solution</button>
        </div>
    )
}

export default Task