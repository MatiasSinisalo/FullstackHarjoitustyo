

const CourseShowCase = ({course}) => {
    const joinToCourse = () => {
        console.log(`Joining course ${course.uniqueName}`)
    }
    
    return (
        <div>
            <h2>{course.uniqueName}</h2>
            <h3>{course.name}</h3>

            <button onClick={joinToCourse}>Join</button>
        </div>
        
    )
}


export default CourseShowCase