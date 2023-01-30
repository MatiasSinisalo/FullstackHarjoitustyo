import { gql } from "@apollo/client";


export const CREATE_COURSE = gql`mutation Mutation($uniqueName: String!, $name: String!, $teacher: String!) {
    createCourse(uniqueName: $uniqueName, name: $name, teacher: $teacher) {
      name
      students {
        name
        username
      }
      teacher {
        name
        username
      }
      uniqueName
    }
  }`

export const GET_ALL_COURSES = gql`query AllCourses {
    allCourses {
      name
      students {
        name
        username
      }
      teacher {
        name
        username
      }
      uniqueName
    }
  }`

export const ADD_STUDENT_TO_COURSE = gql`mutation AddStudentToCourse($username: String!, $courseUniqueName: String!) {
    addStudentToCourse(username: $username, courseUniqueName: $courseUniqueName) {
      name
      students {
        name
        username
      }
      teacher {
        name
        username
      }
      uniqueName
    }
  }`