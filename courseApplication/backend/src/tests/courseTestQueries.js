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
      tasks{
        description
      }
      uniqueName
    }
  }`

const removeCourse = `
mutation Mutation($uniqueName: String!) {
  removeCourse(uniqueName: $uniqueName)
}
`


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
    deadline
    description
    id
    submissions {
      content
      id
      submitted
      fromUser {
        id
        name
        username
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

const getAllCourses = `
query AllCourses {
  allCourses {
    id
    name
    students {
      name
      id
      username
    }
    teacher {
      name
      username
      id
    }
    tasks {
      deadline
      description
      id
      submissions {
        content
        fromUser {
          id
          name
          username
        }
        submitted
        id
      }
    }
    uniqueName
  }
}
`

const getCourse = `query GetCourse($uniqueName: String!) {
  getCourse(uniqueName: $uniqueName) {
    id
    name
    students {
      id
      name
      username
    }
    tasks {
      deadline
      description
      id
      submissions {
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
    teacher {
      id
      name
      username
    }
    uniqueName
  }
}
`



module.exports = {createCourse, removeCourse, addStudentToCourse, removeStudentFromCourse, addTaskToCourse, addSubmissionToCourseTask, getAllCourses, getCourse}

