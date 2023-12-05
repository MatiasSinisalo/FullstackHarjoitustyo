const { gql } = require("apollo-server-core")

const createCourse = `mutation Mutation($uniqueName: String!, $name: String!) {
    createCourse(uniqueName: $uniqueName, name: $name) {
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
        textTasks{
          description
        }
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
const addInfoPageToCourse = `
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

const removeInfoPageFromCourse = `
mutation RemoveInfoPageFromCourse($courseUniqueName: String!, $infoPageId: String!) {
  removeInfoPageFromCourse(courseUniqueName: $courseUniqueName, infoPageId: $infoPageId)
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

const modifyContentBlock = `
mutation ModifyContentBlock($courseUniqueName: String!, $infoPageId: String!, $contentBlockId: String!, $content: String!) {
  modifyContentBlock(courseUniqueName: $courseUniqueName, infoPageId: $infoPageId, contentBlockId: $contentBlockId, content: $content) {
    content
    id
    position
  }
}
`
const removeContentBlockFromInfoPage = `
mutation RemoveContentBlockFromInfoPage($courseUniqueName: String!, $infoPageId: String!, $contentBlockId: String!) {
  removeContentBlockFromInfoPage(courseUniqueName: $courseUniqueName, infoPageId: $infoPageId, contentBlockId: $contentBlockId)
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
      textTasks{
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
      textTasks{
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

const createChatRoom = `
mutation CreateChatRoom($courseUniqueName: String!, $name: String!) {
  createChatRoom(courseUniqueName: $courseUniqueName, name: $name) {
    admin {
      name
      id
      username
    }
    id
    messages {
      content
      fromUser {
        name
        id
        username
      }
      sendDate
      id
    }
    name
    users {
      id
      name
      username
    }
  }
}
`

const removeChatRoom = `
mutation RemoveChatRoom($courseUniqueName: String!, $chatRoomId: String!) {
  removeChatRoom(courseUniqueName: $courseUniqueName, chatRoomId: $chatRoomId)
}
`

const createMessage = `
mutation RemoveChatRoom($courseUniqueName: String!, $chatRoomId: String!, $content: String!) {
  createMessage(courseUniqueName: $courseUniqueName, chatRoomId: $chatRoomId, content: $content) {
    content
    fromUser {
      id
      name
      username
    }
    id
    sendDate
  }
}
`

const addUserToChatRoom = `
mutation AddUserToChatRoom($courseUniqueName: String!, $chatRoomId: String!, $username: String!) {
  addUserToChatRoom(courseUniqueName: $courseUniqueName, chatRoomId: $chatRoomId, username: $username) {
    id
    name
    username
  }
}
`

const removeUserFromChatRoom = `
mutation Mutation($courseUniqueName: String!, $chatRoomId: String!, $username: String!) {
  removeUserFromChatRoom(courseUniqueName: $courseUniqueName, chatRoomId: $chatRoomId, username: $username)
}
`


const createMultipleChoiceTask = `
mutation Mutation($courseUniqueName: String!, $description: String!, $deadline: String!) {
  createMultipleChoiceTask(courseUniqueName: $courseUniqueName, description: $description, deadline: $deadline) {
    answers {
      choices {
        option {
          description
          isCorrect
          points
        }
        selected
      }
      fromUser {
        id
        name
      }
    }
    deadline
    description
    id
    questions {
      description
      isCorrect
      points
    }
  }
}
`

const removeMultipleChoiceTask = `
mutation RemoveMultipleChoiceTask($courseUniqueName: String!, $multipleChoiceTaskId: String!) {
  removeMultipleChoiceTask(courseUniqueName: $courseUniqueName, multipleChoiceTaskId: $multipleChoiceTaskId)
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
                  addInfoPageToCourse,
                  removeInfoPageFromCourse,
                  addContentBlockToInfoPage,
                  removeContentBlockFromInfoPage,
                  modifyContentBlock,
                  createChatRoom,
                  removeChatRoom,
                  createMessage,
                  addUserToChatRoom,
                  removeUserFromChatRoom,
                  createMultipleChoiceTask,
                  removeMultipleChoiceTask
                }

