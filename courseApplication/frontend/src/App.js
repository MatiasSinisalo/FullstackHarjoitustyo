import {
  Routes, Route,
} from 'react-router-dom';
import React, {useEffect} from 'react';
import Calendar from './components/calendar/Calendar';
import Course from './components/course/Course';
import CreateCourse from './components/CreateCourse';
import CourseBrowser from './components/CourseBrowser';
import Dashboard from './components/Dashboard';
import Messages from './components/course/Messages';
import LogIn from './components/LogIn';
import loginService from './services/logInService';
import {useNavigate} from 'react-router-dom';

import {useApolloClient, useQuery} from '@apollo/client';
import NavBar from './components/NavBar';
import {useDispatch} from 'react-redux';
import CreateAccount from './components/CreateAccount';
import {Notify} from './reducers/notificationReducer';
import './components/styles/app.css';
import {ME} from './queries/userQueries';
import PrivacyStatement from './components/PrivacyStatement';
import {FillInUserInformationGoogle, GoogleAuthenticate} from './components/openID/GoogleLogin';
import {FillInUserInformationHY, HYAuthenticate} from './components/openID/HYLogin';


const App = () =>{
  const client = useApolloClient();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userQuery = useQuery(ME);

  useEffect(() => {
    const token = localStorage.getItem('courseApplicationUserToken');
    if (!token) {
      // navigate("/")
    }
  }, []);

  const handleLogIn = async (username, password) => {
    const userInfo = await loginService.LogInAsUser(username, password, client);
    console.log(userInfo);
    if (!userInfo.error) {
      navigate('/dashboard');
      dispatch(Notify('Logged In Successfully', 'successNotification', 5));
    } else {
      dispatch(Notify('password or username are incorrect', 'errorNotification', 5));
    }
  };

  const handleLogOut = async () => {
    console.log('logging out');
    localStorage.removeItem('courseApplicationUserToken');

    client.clearStore();
    navigate('/');
    dispatch(Notify('Logged Out Successfully', 'successNotification', 5));
  };

  if (userQuery.loading) {
    return (
      <p>loading...</p>
    );
  }

  return (
    <>
      <NavBar logOut={handleLogOut}></NavBar>
      <div id="app-content" className="background">


        <Routes>
          <Route path="/" element={<LogIn handleLogIn={handleLogIn}/>}/>
          <Route path="/createAccount" element={<CreateAccount></CreateAccount>}/>
          <Route path="/createAccount/fillInInformation/google" element={<FillInUserInformationGoogle></FillInUserInformationGoogle>}/>
          <Route path="/createAccount/fillInInformation/HY" element={<FillInUserInformationHY></FillInUserInformationHY>}/>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/calendar" element={<Calendar/>}/>
          <Route path="/messages" element={<Messages/>}/>
          <Route path="/CourseBrowser" element={<CourseBrowser/>}/>
          <Route path="/CreateCourse" element={<CreateCourse/>}/>
          <Route path="/course/:uniqueName/*" element={<Course/>}></Route>
          <Route path="/privacyStatement" element={<PrivacyStatement></PrivacyStatement>}></Route>
          <Route path="/login/google" element={<GoogleAuthenticate></GoogleAuthenticate>}></Route>
          <Route path="/login/HY" element={<HYAuthenticate></HYAuthenticate>}></Route>

        </Routes>
      </div>
    </>
  );
};

export default App;
