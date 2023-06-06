import { useApolloClient, useQuery } from "@apollo/client"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  Link,
    Outlet,
    Route,
    Routes,
    useParams
} from "react-router-dom"
import { GET_COURSE } from "../queries/courseQueries"
import { getCourseWithUniqueName } from "../reducers/courseReducer"
import Task from "./Task"
import TaskListings from "./TaskListings"
import "./styles/course.css"
import { ME } from "../queries/userQueries"
import TeachersCourse, { TaskCreationForm } from "./TeachersCourse"
import CourseParticipants from "./CourseParticipants"
import CreateInfoPage from "./CreateInfoPage"
import InfoPage from "./InfoPage"



const Course = () =>{
  const dispatch = useDispatch()
  const client = useApolloClient()

  const uniqueName = useParams().uniqueName
 
  const courseQuery = useQuery(GET_COURSE, {variables: {uniqueName}})
  const userQuery = useQuery(ME)
  if(courseQuery.loading || userQuery.loading)
  {
    return(<p>loading...</p>)
  }
  const course = courseQuery.data?.getCourse
  if(!course)
  {
    return(
    <>
    <h1>Whoops</h1>
    <Link to='/dashboard'>it seems like this course doesnt exist, click here to go back to dashboard</Link>
    </>
    )
  }
  const user = userQuery.data.me
  
  return(
    <div className="course">
    <h1>{course.uniqueName}</h1>
    <h2>{course.name}</h2>
    <p>single course page</p>
    <div className="blueBox">
      <p>course navigation</p>
      {user.username === course.teacher.username ? <Link to="teacher">teachers view</Link> : <></>}
      <br></br>
      <Link to="tasks">tasks</Link>

      <div className="blueBox infoPageListing">
        <p>courses info pages</p>
        {course.infoPages.map((page) => <Link key={page.locationUrl} to={`page/${page.locationUrl}`}>{page.locationUrl}</Link>)}
      </div>
    </div>

   
    
    <Routes>
      <Route path="teacher" element={<TeachersCourse course={course}/>}>
          <Route path="participants" element={<CourseParticipants course={course}></CourseParticipants>}/>
          <Route path="newTask" element={<TaskCreationForm course={course}></TaskCreationForm>}/>
          <Route path="newInfoPage" element={<CreateInfoPage course={course}></CreateInfoPage>}/>
        </Route>
      <Route path="tasks" element={<TaskListings course={course}></TaskListings>}/>
      <Route path="task/:taskId/*" element={<Task course={course}/>}/>  
      <Route path="page/:infoPageUrl" element={<InfoPage course={course} user={user}></InfoPage>}/>
    </Routes>
    
    </div>

  )
  
}
  
 

export default Course