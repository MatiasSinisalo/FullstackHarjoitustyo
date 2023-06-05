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
      infoPages{
        locationUrl
      }
    }
  }`

const removeCourse = `
mutation Mutation($uniqueName: String!) {
  removeCourse(uniqueName: $uniqueName)
}
`
const addInfoPageOnCourse = `
mutation AddInfoPageToCourse($locationUrl: String!, $courseUniqueName: String!) {
  addInfoPageToCourse(locationUrl: $locationUrl, courseUniqueName: $courseUniqueName) {
    id
    contentBlocks {
      content
      position
    }
    locationUrl
  }
}
`

const addContentBlockToInfoPage = `
mutation AddContentBlockToInfoPage($courseUniqueName: String!, $content: String!, $position: Int!, $infoPageId: String!) {
  addContentBlockToInfoPage(courseUniqueName: $courseUniqueName, content: $content, position: $position, infoPageId: $infoPageId) {
    content
    id
    position
  }
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

const addTaskToCourse = `mutation Mutation($courseUniqueName: String!, $description: String!, $deadline: String!, $maxGrade: Int) {
  addTaskToCourse(courseUniqueName: $courseUniqueName, description: $description, deadline: $deadline, maxGrade: $maxGrade) {
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
    submittedDate
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
        id
        content        
        submitted
        fromUser {
          id
          name
          username
        }
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
const removeTaskFromCourse = `
mutation RemoveTaskFromCourse($courseUniqueName: String!, $taskId: String!) {
  removeTaskFromCourse(courseUniqueName: $courseUniqueName, taskId: $taskId)
}
`

const removeSubmissionFromCourseTask = `
mutation RemoveSubmissionFromCourseTask($courseUniqueName: String!, $taskId: String!, $submissionId: String!) {
  removeSubmissionFromCourseTask(courseUniqueName: $courseUniqueName, taskId: $taskId, submissionId: $submissionId)
}
`


const modifySubmission = `
mutation ModifySubmission($courseUniqueName: String!, $taskId: String!, $submissionId: String!, $content: String!, $submitted: Boolean!) {
  modifySubmission(courseUniqueName: $courseUniqueName, taskId: $taskId, submissionId: $submissionId, content: $content, submitted: $submitted) {
    content
    fromUser {
      id
      name
      username
    }
    id
    submitted
    submittedDate
  }
}
`

const gradeSubmission = `
mutation GradeSubmission($courseUniqueName: String!, $taskId: String!, $submissionId: String!, $points: Int!) {
  gradeSubmission(courseUniqueName: $courseUniqueName, taskId: $taskId, submissionId: $submissionId, points: $points) {
    content
    fromUser {
      id
      name
      username
    }
    grade {
      date
      id
      points
    }
    id
    submitted
    submittedDate
  }
}
`
module.exports = {createCourse, 
                  removeCourse, 
                  addStudentToCourse, 
                  removeStudentFromCourse, 
                  addTaskToCourse, 
                  addSubmissionToCourseTask, 
                  getAllCourses, 
                  getCourse, 
                  removeTaskFromCourse, 
                  removeSubmissionFromCourseTask, 
                  modifySubmission,
                  gradeSubmission,
                  addInfoPageOnCourse,
                  addContentBlockToInfoPage
                }

