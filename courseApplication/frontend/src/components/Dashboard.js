import React from 'react'
import { useApolloClient, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import CourseShowCase from './course/CourseShowCase';
import { ME } from '../queries/userQueries';
import './styles/dashboard.css';

const Dashboard = () =>{
  const userQuery = useQuery(ME);// useSelector((store) => {return store.user})
  const client = useApolloClient();

  if (userQuery.loading) {
    return (<p>loading...</p>);
  }

  const user = userQuery.data.me;
  const usersCourses = user.attendsCourses;
  const coursesWhereUserTeaches = user.teachesCourses;
  return (

    <div className="dashboard-courses">

      <div className="dashboard-greetings ">
        <h1>Dashboard</h1>
        <h2>Hello {user.username}</h2>
        <p>users name: {user.name}</p>
      </div>


      <div className="dashboard-courses ">

        <h2>
            Your courses
        </h2>


        {
          usersCourses != undefined ? usersCourses.map((course) => <CourseShowCase currentUser={user} key={course.uniqueName} course={course}></CourseShowCase>) : <></>
        }

        <h2>
            Your courses where you are a teacher
        </h2>
        <div className="dashboard-create-course primary">
          <Link className="action-button" to="/CreateCourse">Create new Course</Link>
        </div>
        {
            coursesWhereUserTeaches != undefined ? coursesWhereUserTeaches.map((course) => <CourseShowCase currentUser={user} key={course.uniqueName} course={course}></CourseShowCase>) : <></>
        }

      </div>
    </div>

  );
};

export default Dashboard;
