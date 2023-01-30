

const CourseShowCase = ({course}) => {
    return (
        <p key={course.uniqueName}>{course.uniqueName} {course.name}</p>
    )
}


export default CourseShowCase