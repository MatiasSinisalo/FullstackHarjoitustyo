import {
  BrowserRouter as Router,
  Routes, Route, Link,
  useParams
} from "react-router-dom"
import Calendar from "./components/Calendar";
import {CourseBrowser, CreateCourse, Course} from "./components/Course";
import Dashboard from "./components/Dashboard";
import Messages from "./components/Messages";
import LogIn from "./components/LogIn";

const App = () =>{
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


  return (
    <Router>
      <Routes>
        <Route path="/" element={<LogIn/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/calendar" element={<Calendar/>}/>
        <Route path="/messages" element={<Messages/>}/>
        <Route path="/CourseBrowser" element={<CourseBrowser courses={courses}/>}/>
        <Route path="/CreateCourse" element={<CreateCourse/>}/>
        <Route path="/course/:id" element={<Course courses={courses}/>}/>
      </Routes>
    </Router>
  );
}

export default App;
