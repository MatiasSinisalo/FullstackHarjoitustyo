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
import TeachersCourse from "./components/TeachersCourse";
import CreateAccount from "./components/CreateAccount";
import Notification from "./components/Notification";
import { Notify } from "./reducers/notificationReducer";


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
   // console.log(userInfo)
    if(userInfo)
    {
      dispatch(updateUser(userInfo))
      navigate('/dashboard')
    }
  } 

  const handleLogOut = async () => {
    console.log("logging out")
    localStorage.removeItem('courseApplicationUserToken')
    dispatch(updateUser({username: null, name: null, token: null}))
    client.clearStore()
    navigate('/')
  }
  dispatch(Notify("welcome to the app", "successNotification", 5))
  dispatch(Notify("welcome to the app2", "successNotification", 5))
  dispatch(Notify("welcome to the app3", "successNotification", 5))
  dispatch(Notify("welcome to the app4", "successNotification", 5))
  dispatch(Notify("welcome to the app5", "successNotification", 5))
  dispatch(Notify("welcome to the app6", "successNotification", 5))
  dispatch(Notify("welcome to the app7", "successNotification", 5))
  dispatch(Notify("welcome to the app8", "successNotification", 5))
  dispatch(Notify("welcome to the app9", "successNotification", 5))
  dispatch(Notify("welcome to the app10", "successNotification", 5))
  return (
    <>
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
        <Route path="/course/:uniqueName" element={<Course/>}/>
        <Route path="/course/:uniqueName/teacher" element={<TeachersCourse/>}/>
      </Routes>
      </>
  );
}

export default App;
