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
import { GET_COURSE } from "../../queries/courseQueries"
import { getCourseWithUniqueName } from "../../reducers/courseReducer"
import Task from "./Task"
import TaskListings from "./TaskListings"
import "../styles/course.css"
import { ME } from "../../queries/userQueries"
import TeachersCourse, { TaskCreationForm } from "./TeachersCourse"
import CourseParticipants from "./CourseParticipants"
import CreateInfoPage from "./CreateInfoPage"
import InfoPage from "./InfoPage"
import CreateChatRoom from "./CreateChatRoom"
import ChatRoom from "./ChatRoom"



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
    <div className="course container">
      <div className="container">
        <h1>{course.name}</h1>
        <h2>{course.uniqueName}</h2>
      </div>
     
      <CourseNavigation course={course} user={user}/>

      <Routes>
        <Route path="teacher" element={<TeachersCourse course={course}/>}>
            <Route path="participants" element={<CourseParticipants course={course}></CourseParticipants>}/>
            <Route path="newTask" element={<TaskCreationForm course={course}></TaskCreationForm>}/>
            <Route path="newInfoPage" element={<CreateInfoPage course={course}></CreateInfoPage>}/>
            <Route path="newChatRoom" element={<CreateChatRoom course={course}></CreateChatRoom>}/>
          </Route>
        <Route path="chatRooms" element={<ChatRoomsList course={course}></ChatRoomsList>}></Route>
        <Route path="infoPages" element={<InfoPagesList course={course}></InfoPagesList>}></Route>
        <Route path="tasks" element={<TaskListings course={course}></TaskListings>}/>
        <Route path="task/:taskId/*" element={<Task course={course}/>}/>  
        <Route path="page/:infoPageUrl" element={<InfoPage course={course} user={user}></InfoPage>}/>
        <Route path="chatRoom/:chatRoomId/" element={<ChatRoom course={course} user={user}/>}/>  
      </Routes>
    
    </div>

  )
  
}

const CourseNavigation = ({course, user}) => {
  return(
    <div className="container primary course-navigation">
        <h3>course navigation</h3>
        {user.username === course.teacher.username ? <Link className="course-link" to="teacher">teachers view</Link> : <></>}
        <Link className="course-link" to="tasks">tasks</Link>
        <Link className="course-link" to="chatRooms">chatrooms</Link>
        <Link className="course-link" to="infoPages">info pages</Link>
      </div>
  )
}

const ChatRoomsList = ({course}) => {
  return(
  <div className="container primary chatroom-listing">
    <h3>chatrooms: </h3>
    {course.chatRooms.map((room) => <Link className="course-link" key={room.id} to={`/course/${course.uniqueName}/chatRoom/${room.id}`}>{room.name}</Link>)}
  </div>
  )
}

const InfoPagesList = ({course}) => {
  return(
    <div className="container primary info-page-listing">
      <h3>courses info pages</h3>
      {course.infoPages.map((page) => <Link className="course-link" key={page.locationUrl} to={`/course/${course.uniqueName}/page/${page.locationUrl}`}>{page.locationUrl}</Link>)}
    </div>
  )
}

export default Course