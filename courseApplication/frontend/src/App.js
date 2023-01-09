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
import { useUserLogIn } from './services/logInService'
import {useNavigate} from 'react-router-dom'


const App = () =>{
  const [user, setUser] = useState({username: null, token: null})
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
  
  const LogInAsUser = useUserLogIn()
  const handleLogIn = async (username, password) => {
    const token = await LogInAsUser(username, password)
    if(token)
    {
      setUser({username: "not implemented yet", token: token.value})
      navigate('/dashboard')
    }
  } 

  return (
    
      <Routes>
        <Route path="/" element={<LogIn handleLogIn={handleLogIn}/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/calendar" element={<Calendar/>}/>
        <Route path="/messages" element={<Messages/>}/>
        <Route path="/CourseBrowser" element={<CourseBrowser courses={courses}/>}/>
        <Route path="/CreateCourse" element={<CreateCourse/>}/>
        <Route path="/course/:id" element={<Course courses={courses}/>}/>
      </Routes>
    
  );
}

export default App;
