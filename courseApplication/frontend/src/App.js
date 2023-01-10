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
import { useUser, useUserLogIn } from './services/logInService'
import {useNavigate} from 'react-router-dom'

import { useApolloClient} from "@apollo/client";
import NavBar from "./components/NavBar";
import { useDispatch } from "react-redux";
import { userLogIn } from "./reducers/userReducer";


const App = () =>{
  
 
  const client = useApolloClient()
  const LogInAsUser = useUser(client)
  const [user, setUser] = useState({username: null, name: null, token: null})
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
    const userInfo = await LogInAsUser(username, password)
    console.log(userInfo)
    if(userInfo)
    {
      setUser(userInfo)
      navigate('/dashboard')
    }
  } 

  const handleLogOut = () => {
    console.log("logging out")
    localStorage.removeItem('courseApplicationUserToken')
    setUser({username: null, name: null, token: null})
    navigate('/')
  }

  return (
    <>
      <NavBar user={user} logOut={handleLogOut}></NavBar>
      <Routes>
        <Route path="/" element={<LogIn handleLogIn={handleLogIn}/>}/>
        <Route path="/dashboard" element={<Dashboard user={user}/>}/>
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
