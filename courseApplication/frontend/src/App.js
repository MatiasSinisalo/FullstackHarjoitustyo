import {
  BrowserRouter as Router,
  Routes, Route, Link,
  useParams
} from "react-router-dom"
import { useEffect, useState } from "react";
import Calendar from "./components/Calendar";
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
import { updateUser, userLogIn } from "./reducers/userReducer";
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

const App = () =>{
  
 
  const client = useApolloClient()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  useEffect(() => {
      async function prepApp(){ 
        const token = localStorage.getItem('courseApplicationUserToken')
        if(token)
        {
          const userdata = await getUserData(client)
          dispatch(updateUser(userdata))
        }
    }
    prepApp()
  }, [])
  
  const handleLogIn = async (username, password) => {
    const userInfo = await LogInAsUser(username, password, client)
    console.log(userInfo)
    if(!userInfo.error)
    {
      dispatch(updateUser(userInfo))
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
    dispatch(updateUser({username: null, name: null, token: null}))
    client.clearStore()
    navigate('/')
    dispatch(Notify("Logged Out Successfully", "successNotification", 5))
  }
 
  return (
    <div id="appContent">
      <NavBar logOut={handleLogOut}></NavBar>
      <Notification></Notification>
      <Routes>
        <Route path="/" element={<LogIn handleLogIn={handleLogIn}/>}/>
        <Route path="/createAccount" element={<CreateAccount></CreateAccount>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/calendar" element={<Calendar/>}/>
        <Route path="/messages" element={<Messages/>}/>
        <Route path="/CourseBrowser" element={<CourseBrowser/>}/>
        <Route path="/CreateCourse" element={<CreateCourse/>}/>
        <Route path="/course/:uniqueName" element={<Course/>}>
          <Route path="teacher" element={<TeachersCourse/>}>
            <Route path="participants" element={<CourseParticipants></CourseParticipants>}/>
            <Route path="newTask" element={<TaskCreationForm></TaskCreationForm>}/>
          </Route>
          <Route path="tasks" element={<TaskListings></TaskListings>}/>
          <Route path="task/:taskId" element={<Task/>}/>  
        </Route>
      
      </Routes>
    </div>
  );
}

export default App;
