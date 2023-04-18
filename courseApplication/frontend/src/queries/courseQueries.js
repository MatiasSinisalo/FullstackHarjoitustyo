import { gql } from "@apollo/client";


export const CREATE_COURSE = gql`mutation Mutation($uniqueName: String!, $name: String!, $teacher: String!) {
    createCourse(uniqueName: $uniqueName, name: $name, teacher: $teacher) {
      id
      uniqueName
      name
      students {
        name
        username
      }
      teacher {
        name
        username
      }
      tasks{
        id
        deadline
        description
      }
    }
  }`


export const REMOVE_COURSE  = gql`
mutation Mutation($uniqueName: String!) {
  removeCourse(uniqueName: $uniqueName)
}
`

export const GET_ALL_COURSES = gql`query AllCourses {
    allCourses {
      id
      uniqueName
      name
      students {
        name
        username
      }
      teacher {
        name
        username
      }
     
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
    id
    uniqueName
    name
    students {
      name
      username
    }
    tasks {
      id
      deadline
      description
      submissions{
        id
        content
        submitted
      }
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
      id
      uniqueName
      name
      students {
        name
        username
      }
      teacher {
        name
        username
      }
      tasks{
        deadline
        description
        id
      }
      
    }
  }`

export const REMOVE_STUDENT_FROM_COURSE = gql`mutation RemoveStudentFromCourse($username: String!, $courseUniqueName: String!) {
  removeStudentFromCourse(username: $username, courseUniqueName: $courseUniqueName) {
    id
    uniqueName
    name
    students {
      name
      username
    }
    teacher {
      name
      username
    }
  }
}`

export const ADD_TASK_TO_COURSE = gql`
mutation AddTaskToCourse($courseUniqueName: String!, $description: String!, $deadline: String!) {
  addTaskToCourse(courseUniqueName: $courseUniqueName, description: $description, deadline: $deadline) {
    id
    deadline
    description
    submissions {
      content
      fromUser {
        name
        username
      }
      submitted
    }
  }
}

`

export const ADD_SUBMISSION_TO_COURSE = gql`
mutation Mutation($courseUniqueName: String!, $taskId: String!, $content: String!, $submitted: Boolean!) {
  addSubmissionToCourseTask(courseUniqueName: $courseUniqueName, taskId: $taskId, content: $content, submitted: $submitted) {
    id
    submitted
    content
    fromUser {
      id
      name
      username
    }
  }
}
`

export const REMOVE_TASK_FROM_COURSE = gql`
mutation RemoveTaskFromCourse($courseUniqueName: String!, $taskId: String!) {
  removeTaskFromCourse(courseUniqueName: $courseUniqueName, taskId: $taskId)
}
`

export const REMOVE_SUBMISSION_FROM_COURSE_TASK = gql`
mutation RemoveSubmissionFromCourseTask($courseUniqueName: String!, $taskId: String!, $submissionId: String!) {
  removeSubmissionFromCourseTask(courseUniqueName: $courseUniqueName, taskId: $taskId, submissionId: $submissionId)
}
`