import { useApolloClient } from "@apollo/client"
import { useDispatch, useSelector } from "react-redux"
import { addStudentToCourse } from "../reducers/courseReducer"


const CourseShowCase = ({course}) => {
    const currentUser = useSelector((store) => store.user)
    const client = useApolloClient()
    const dispatch = useDispatch()
    const joinToCourse = () => {
        console.log(`Joining course ${course.uniqueName}`)
        dispatch(addStudentToCourse(course.uniqueName, currentUser.username, client))
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