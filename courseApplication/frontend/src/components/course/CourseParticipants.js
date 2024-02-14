import {useApolloClient} from '@apollo/client';
import React from 'react'
import {useDispatch} from 'react-redux';
import '../styles/course.css';
import {removeStudentFromCourse} from '../../reducers/courseReducer';


const StudentListing = ({student, course}) => {
  const client = useApolloClient();
  const dispatch = useDispatch();
  const removeStudent = async () => {
    await removeStudentFromCourse(course.uniqueName, student.username, client);
  };
  return (
    <tr>
      <td>{student.username}</td>
      <td><button className="dangerous-button" onClick={() => removeStudent()}>remove from course</button></td>
    </tr>
  );
};

const CourseParticipants = ({course}) => {
  return (
    <div className="primary">
      <h3>participating students</h3>
      <table>
        <thead>
          <tr>
            <th>username</th>
            <th>remove</th>
          </tr>
        </thead>
        <tbody>
          {course.students.map((student) => <StudentListing student={student} course={course} key={student.username}></StudentListing>)}
        </tbody>
      </table>
    </div>
  );
};

export default CourseParticipants;
