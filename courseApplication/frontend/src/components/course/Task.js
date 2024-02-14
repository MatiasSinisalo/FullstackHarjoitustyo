import React from 'react'
import SubmitSolutionView from './SubmitSolutionView';
import AnswersView from './AnswersView';
import '../styles/course.css';
import {useApolloClient, useQuery} from '@apollo/client';
import {ME} from '../../queries/userQueries';

import {useDispatch} from 'react-redux';
import {removeTaskFromCourse} from '../../reducers/courseReducer';
import {
  Link, Route,
  Routes,
  useParams,
} from 'react-router-dom';
import Submission from './Submission';
const Task = ({course}) => {
  const client = useApolloClient();
  const dispatch = useDispatch();
  const taskId = useParams().taskId;
  const userQuery = useQuery(ME);
  if (userQuery.loading) {
    return (<p>loading...</p>);
  }


  const user = userQuery.data.me;
  const task = course.tasks.textTasks.find((task) => task.id === taskId);

  if (!task) {
    return (
      <>
        <Link to={`/course/${course.uniqueName}/tasks`}>it seems like this task doesnt exist, click here to go back to course tasks</Link>
      </>
    );
  }

  const deadline = new Date(parseInt(task.deadline)).toISOString().split('T')[0];


  const removeTask = async () => {
    await removeTaskFromCourse(course, task, client);
  };

  return (
    <div className={`task:${task.id} container  task`}>
      <Link className="course-link" to={`/course/${course.uniqueName}/tasks`}>back to tasks</Link>

      <div className="container primary task-information">
        <p className="course-task-description">{task.description}</p>
        <p className="course-task-deadline">deadline: {deadline}</p>
        {task?.maxGrade ? <p className="course-task-grade">max grade: {task?.maxGrade}</p> : <></>}
      </div>
      <Routes>
        <Route path="/" element={<SubmitSolutionView course={course} task={task} user={user}></SubmitSolutionView>}/>
        <Route path="submission/:submissionId" element={<Submission course={course} task={task}/>}/>
      </Routes>

      {user.username === course.teacher.username ? <TeacherTaskActions course={course} task={task} user={user} removeTask={removeTask}></TeacherTaskActions> : <></>}
    </div>
  );
};

const TeacherTaskActions = ({course, task, user, removeTask}) => {
  return (
    <div className="task-teacher-actions container primary">
      <h3>other actions: </h3>

      <h3>view answers: </h3>
      <AnswersView course={course} task={task}/>

      <h3>remove this task: </h3>
      {user.username === course.teacher.username ? <button className="dangerous-button" onClick={removeTask}>remove task</button> : <></>}
    </div>
  );
};

export default Task;
