import { useApolloClient, useQuery } from "@apollo/client"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  Link,
  useNavigate,
    useParams
} from "react-router-dom"
import { GET_COURSE } from "../queries/courseQueries"
import courseService from "../services/courseService"
import Task from "./Task"
import { Notify } from "../reducers/notificationReducer"
import TaskListings from "./TaskListings"
import "./styles/course.css"
import { createNewTaskOnCourse, removeCourse, removeStudentFromCourse } from "../reducers/courseReducer"


const StudentListing = ({student, course}) => {
  const client = useApolloClient()
  const dispatch = useDispatch()
  const removeStudent = async () => {
    await dispatch(removeStudentFromCourse(course.uniqueName, student.username, client))
  }
  return (
    <tr>
        <td>{student.username}</td>
        <td><button onClick={() => removeStudent()}>remove from course</button></td>
    </tr>
  )
}

const CourseParticipants = () => {
  const uniqueName = useParams().uniqueName
  const courseQuery = useQuery(GET_COURSE, {variables: {uniqueName}})
  if(courseQuery.loading)
  {
    return(<p>loading...</p>)
  }
  
  const course = courseQuery.data?.getCourse
  if(!course)
  {
    return(<>
    <h1>Whoops</h1>
    <Link to='/dashboard'>it seems like this course doesnt exist, click here to go back to dashboard</Link>
    </>)
  }

  return (
    <div className="blueBox">
      <h3>participating students</h3>
      <table>
        <thead>
            <tr>
                <th>username</th>
                <th>remove</th>
            </tr>
        </thead>
        <tbody>
            {course.students.map((student) => <StudentListing student={student} course={course} key={student.username}></StudentListing>)}
        </tbody>
    </table>
    </div>
  )
}

export default CourseParticipants