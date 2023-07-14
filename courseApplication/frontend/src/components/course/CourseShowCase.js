import { useApolloClient } from "@apollo/client"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { addStudentToCourse, removeStudentFromCourse } from "../../reducers/courseReducer"
import '../styles/course.css'

const CourseShowCase = ({course, currentUser}) => {
    const thisUserIsParticipating = currentUser.attendsCourses.find((other) => other.id == course.id)
    const thisUserIsTeaching = currentUser.teachesCourses.find((other) => other.id == course.id)
    const client = useApolloClient()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const joinToCourse = async () => {
        console.log(`Joining course ${course.uniqueName}`)
        await addStudentToCourse(course.uniqueName, currentUser.username, client)
    }
    

    const leaveFromCourse = async () => {
        await removeStudentFromCourse(course.uniqueName, currentUser.username, client)
    }

    const seeCourse = () => {
        navigate(`/course/${course.uniqueName}`)
    }

    const seeCourseAsTeacher = () => {
        navigate(`/course/${course.uniqueName}/teacher`)
    }

    return (
        <div className={`course:${course.id} container primary course-showcase`}>
            <h2>{course.uniqueName}</h2>
            <h3>{course.name}</h3>
            {thisUserIsTeaching ? 
            
            <>
                <button className="action-button" onClick={seeCourseAsTeacher}>See Teachers Course Page</button>
            </>
            :
                <>
                    {thisUserIsParticipating? <button className="action-button" onClick={seeCourse}>See Course Page</button> : <></>}
                    {thisUserIsParticipating ?  <button className="dangerous-button" onClick={leaveFromCourse}>Leave course</button> : <button className="action-button" onClick={joinToCourse}>Join</button>}
                </>
            }
        </div>
        
    )
}


export default CourseShowCase