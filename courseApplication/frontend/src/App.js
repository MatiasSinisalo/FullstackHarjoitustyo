import {
  BrowserRouter as Router,
  Routes, Route, Link,
  useParams
} from "react-router-dom"
import { useEffect, useState } from "react";
import Calendar from "./components/Calendar";
import {CourseBrowser, CreateCourse, Course} from "./components/Course";
import Dashboard from "./components/Dashboard";
import Messages from "./components/Messages";
import LogIn from "./components/LogIn";
import { LogInAsUser } from './services/logInService'
import {useNavigate} from 'react-router-dom'

import { useApolloClient} from "@apollo/client";
import NavBar from "./components/NavBar";
import { useDispatch, useSelector } from "react-redux";
import { updateUser, userLogIn } from "./reducers/userReducer";


const App = () =>{
  
 
  const client = useApolloClient()
  const dispatch = useDispatch()

  

  const courses = [
    {
      id: 0,
      name: "dev1"
    },
    {
      id: 1,
      name: "dev2"
    }
  ]
  const navigate = useNavigate()
  
  const handleLogIn = async (username, password) => {
    const userInfo = await LogInAsUser(username, password, client)
    console.log(userInfo)
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

  return (
    <>
      <NavBar logOut={handleLogOut}></NavBar>
      <Routes>
        <Route path="/" element={<LogIn handleLogIn={handleLogIn}/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/calendar" element={<Calendar/>}/>
        <Route path="/messages" element={<Messages/>}/>
        <Route path="/CourseBrowser" element={<CourseBrowser courses={courses}/>}/>
        <Route path="/CreateCourse" element={<CreateCourse/>}/>
        <Route path="/course/:id" element={<Course courses={courses}/>}/>
      </Routes>
      </>
  );
}

export default App;
