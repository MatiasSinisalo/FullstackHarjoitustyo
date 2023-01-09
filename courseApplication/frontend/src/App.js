import {
  BrowserRouter as Router,
  Routes, Route, Link,
  useParams
} from "react-router-dom"
import { useState } from "react";
import Calendar from "./components/Calendar";
import {CourseBrowser, CreateCourse, Course} from "./components/Course";
import Dashboard from "./components/Dashboard";
import Messages from "./components/Messages";
import LogIn from "./components/LogIn";
import { useUser, useUserLogIn } from './services/logInService'
import {useNavigate} from 'react-router-dom'

import { useApolloClient} from "@apollo/client";


const App = () =>{
  const {user, LogInAsUser} = useUser()
  const client = useApolloClient()
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
    await LogInAsUser(username, password)
    if(user.username)
    {
      navigate('/dashboard')
    }
  } 

  return (
      <Routes>
        <Route path="/" element={<LogIn handleLogIn={handleLogIn}/>}/>
        <Route path="/dashboard" element={<Dashboard user={user}/>}/>
        <Route path="/calendar" element={<Calendar/>}/>
        <Route path="/messages" element={<Messages/>}/>
        <Route path="/CourseBrowser" element={<CourseBrowser courses={courses}/>}/>
        <Route path="/CreateCourse" element={<CreateCourse/>}/>
        <Route path="/course/:id" element={<Course courses={courses}/>}/>
      </Routes>
  );
}

export default App;
