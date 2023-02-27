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
      tasks {
        id
        deadline
        description
      }
    }
  }`

export const GET_COURSE = gql`
query GetCourse($uniqueName: String!) {
  getCourse(uniqueName: $uniqueName) {
    name
    students {
      name
      username
    }
    tasks {
      deadline
      description
      id
    }
    teacher {
      name
      username
    }
  }
}
`

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

export const REMOVE_STUDENT_FROM_COURSE = gql`mutation RemoveStudentFromCourse($username: String!, $courseUniqueName: String!) {
  removeStudentFromCourse(username: $username, courseUniqueName: $courseUniqueName) {
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