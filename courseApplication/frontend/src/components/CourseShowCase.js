import { useApolloClient } from "@apollo/client"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { addStudentToCourse, removeStudentFromCourse } from "../reducers/courseReducer"
import './styles/course.css'

const CourseShowCase = ({course}) => {
    const currentUser = useSelector((store) => store.user)
    const thisUserIsParticipating = course.students.find((student) => student.username === currentUser.username)
    const thisUserIsTeaching = course.teacher.username == currentUser.username
    const client = useApolloClient()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const joinToCourse = () => {
        console.log(`Joining course ${course.uniqueName}`)
        dispatch(addStudentToCourse(course.uniqueName, currentUser.username, client))
    }
    

    const leaveFromCourse = () => {
        dispatch(removeStudentFromCourse(course.uniqueName, currentUser.username, client))
    }

    const seeCourse = () => {
        navigate(`/course/${course.uniqueName}`)
    }

    const seeCourseAsTeacher = () => {
        navigate(`/course/${course.uniqueName}/teacher`)
    }

    return (
        <div className={`course:${course.uniqueName} courseShowCase`}>
            <h2>{course.uniqueName}</h2>
            <h3>{course.name}</h3>
            {thisUserIsTeaching ? 
            
            <>
                <button onClick={seeCourseAsTeacher}>See Teachers Course Page</button>
            </>
            :
                <>
                    {thisUserIsParticipating? <button onClick={seeCourse}>See Course Page</button> : <></>}
                    {thisUserIsParticipating ?  <button onClick={leaveFromCourse}>Leave course</button> : <button onClick={joinToCourse}>Join</button>}
                </>
            }
        </div>
        
    )
}


export default CourseShowCase