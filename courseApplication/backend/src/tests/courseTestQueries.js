const { gql } = require("apollo-server-core")

const createCourse = `mutation Mutation($uniqueName: String!, $name: String!, $teacher: String!) {
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


const addStudentToCourse = `mutation AddStudentToCourse($addStudentToCourseUsername: String!, $courseUniqueName: String!) {
  addStudentToCourse(username: $addStudentToCourseUsername, courseUniqueName: $courseUniqueName) {
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

const removeStudentFromCourse = `mutation RemoveStudentFromCourse($username: String!, $courseUniqueName: String!) {
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

const addTaskToCourse = `mutation Mutation($courseUniqueName: String!, $description: String!, $deadline: String!) {
  addTaskToCourse(courseUniqueName: $courseUniqueName, description: $description, deadline: $deadline) {
    name
    tasks {
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
}
`

const addSubmissionToCourseTask = `
mutation Mutation($courseUniqueName: String!, $taskId: String!, $content: String!, $submitted: Boolean!) {
  addSubmissionToCourseTask(courseUniqueName: $courseUniqueName, taskId: $taskId, content: $content, submitted: $submitted) {
    content
    fromUser {
      id
      name
      username
    }
    id
    submitted
  }
}
`

module.exports = {createCourse, addStudentToCourse, removeStudentFromCourse, addTaskToCourse, addSubmissionToCourseTask}

