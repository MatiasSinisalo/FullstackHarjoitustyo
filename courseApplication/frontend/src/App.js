import {
  BrowserRouter as Router,
  Routes, Route, Link,
  useParams,
  useMatches,
  useMatch,
  useLocation
} from "react-router-dom"
import { useEffect, useState } from "react";
import Calendar from "./components/calendar/Calendar";
import Course from "./components/Course";
import CreateCourse from "./components/CreateCourse";
import CourseBrowser from "./components/CourseBrowser";
import Dashboard from "./components/Dashboard";
import Messages from "./components/Messages";
import LogIn from "./components/LogIn";
import { getUserData, LogInAsUser } from './services/logInService'
import {useNavigate} from 'react-router-dom'

import { useApolloClient, useQuery} from "@apollo/client";
import NavBar from "./components/NavBar";
import { useDispatch, useSelector } from "react-redux";
import { setCourses } from "./reducers/courseReducer";
import { GET_ALL_COURSES } from "./queries/courseQueries";
import TeachersCourse, { TaskCreationForm } from "./components/TeachersCourse";
import CreateAccount from "./components/CreateAccount";
import Notification from "./components/Notification";
import { Notify } from "./reducers/notificationReducer";
import "./components/styles/app.css"
import Task from "./components/Task";
import TaskListings from "./components/TaskListings";
import CourseParticipants from "./components/CourseParticipants";
import Submission from "./components/Submission";
import { ME } from "./queries/userQueries";


const App = () =>{
  
 
  const client = useApolloClient()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const userQuery = useQuery(ME)

  useEffect(() => {
    const token = localStorage.getItem("courseApplicationUserToken")
    if(!token)
    {
      navigate("/")
    }
  }, [])

  const handleLogIn = async (username, password) => {
    const userInfo = await LogInAsUser(username, password, client)
    console.log(userInfo)
    if(!userInfo.error)
    {
      
      navigate('/dashboard')
      dispatch(Notify("Logged In Successfully", "successNotification", 5))
    }
    else{
      dispatch(Notify("password or username are incorrect", "errorNotification", 5))
    }
  } 

  const handleLogOut = async () => {
    console.log("logging out")
    localStorage.removeItem('courseApplicationUserToken')
    
    client.clearStore()
    navigate('/')
    dispatch(Notify("Logged Out Successfully", "successNotification", 5))
  }
 
  if(userQuery.loading){
    return(
    <p>loading...</p>
    )
  }

  return (
    <>
    <NavBar logOut={handleLogOut}></NavBar>
    <div id="app-content" className="background">
      
      
      <Routes>
        <Route path="/" element={<LogIn handleLogIn={handleLogIn}/>}/>
        <Route path="/createAccount" element={<CreateAccount></CreateAccount>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/calendar" element={<Calendar/>}/>
        <Route path="/messages" element={<Messages/>}/>
        <Route path="/CourseBrowser" element={<CourseBrowser/>}/>
        <Route path="/CreateCourse" element={<CreateCourse/>}/>
        <Route path="/course/:uniqueName/*" element={<Course/>}>
      </Route>
      
      </Routes>
    </div>
    </>
  );
}

export default App;
