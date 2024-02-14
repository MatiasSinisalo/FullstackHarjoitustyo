import React from 'react';
import '../styles/month.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';


const Day = ({currentDate, day, courses}) => {
  const weekDay = day.getDay();
  const date = day.getDate();
  const month = day.getMonth();
  const year = day.getFullYear();

  const isCurrentDay = () => {
    return date === currentDate.getDate() && month === currentDate.getMonth() && year == currentDate.getFullYear();
  };

  const currentDayStyle = isCurrentDay() ? ' current-date' : '';
  return (
    <div className={`day day${weekDay}${currentDayStyle} primary`}>
      <p>{day.toDateString()}</p>
      <div className='course-day-showcases'>
        {courses.map((course) => {
          return <CourseTasksDayShowCase key={course.uniqueName} course={course}></CourseTasksDayShowCase>;
        })}
      </div>
    </div>
  );
};


const CourseTasksDayShowCase = ({course}) => {
  const [showDropDown, setDropDown] = useState(false);

  return (
    <>
      <div onClick={() => setDropDown(!showDropDown)} className='course-tasks-day-showcase'>
        <p>tasks: {course.tasks.textTasks.length}, {course.uniqueName}</p>
      </div>

      {showDropDown ? <CourseTasksDropDown course={course}></CourseTasksDropDown> : <></>}

    </>
  );
};

const CourseTasksDropDown = ({course}) => {
  return (
    <div className='course-tasks-dropdown'>
      {
        course.tasks.textTasks.map((task) => <TaskDayShowCase course={course} task={task} key={task.id}></TaskDayShowCase>)
      }
    </div>
  );
};
const TaskDayShowCase = ({course, task}) => {
  return (
    <Link to={`/course/${course.uniqueName}/task/${task.id}`}>
      <p>{task.description}</p>
    </Link>
  );
};


export default Day;
