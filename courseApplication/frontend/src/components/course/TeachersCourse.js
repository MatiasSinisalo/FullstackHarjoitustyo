import React from 'react'
import {useApolloClient, useQuery} from '@apollo/client';
import {useDispatch} from 'react-redux';
import {
  Link,
  Navigate,
  Outlet, useNavigate,
} from 'react-router-dom';
import '../styles/course.css';
import {createNewTaskOnCourse, removeCourse} from '../../reducers/courseReducer';
import {ME} from '../../queries/userQueries';


export const TaskCreationForm = ({course}) => {
  const dispatch = useDispatch();
  const client = useApolloClient();

  const createTaskOnThisCourse = async (event) => {
    event.preventDefault();
    const description = event.target.taskDescription.value;
    const deadline = event.target.taskDeadLine.value;
    const maxGrade = Number(event.target.taskMaxGrade?.value);
    console.log(maxGrade);
    await createNewTaskOnCourse(course.uniqueName, description, deadline, maxGrade, client);
  };

  return (
    <div className="primary">
      <h3>create a new task on the course</h3>
      <form onSubmit={createTaskOnThisCourse}>
        <p>description</p>
        <input type="text" name="taskDescription"></input>
        <br></br>
        <p>deadline</p>
        <input type="date" name="taskDeadLine"></input>
        <br></br>
        <p>max grade</p>
        <input type="number" name="taskMaxGrade"></input>
        <p></p>
        <input className="action-button" type="submit" value="create task"></input>
      </form>
    </div>
  );
};


const TeachersCourse = ({course}) =>{
  const dispatch = useDispatch();
  const client = useApolloClient();
  const navigate = useNavigate();

  const userQuery = useQuery(ME);
  if (userQuery.loading) {
    return (<p>loading...</p>);
  }
  const user = userQuery.data.me;
  if (!(user.username === course.teacher.username)) {
    return (<Navigate to={`/course/${course.uniqueName}`} />);
  }

  const removeThisCourse = async () =>{
    await removeCourse(course, client, navigate);
  };

  return (
    <div className="container  course">
      <h1>course actions</h1>

      <div className="container primary course-teacher-actions">
        <button className="dangerous-button removeCourseButton" onClick={removeThisCourse}>remove course</button>
        <Link className="course-link" to="participants">see course participants</Link>

        <Link className="course-link" to="newTask">create new task</Link>

        <Link className="course-link" to="newInfoPage">create new info page</Link>

        <Link className="course-link" to="newChatRoom">create new chatroom</Link>
      </div>
      <div className="container primary course-teacher-content">
        <Outlet></Outlet>
      </div>
    </div>

  );
};


export default TeachersCourse;
