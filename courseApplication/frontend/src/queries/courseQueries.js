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
      maxGrade
      submissions{
        id
        content
        submitted
        submittedDate
        fromUser{
          username
          name
        }
        grade{
          points
          date
        }
      }
    }
    teacher {
      name
      username
    }
    infoPages{
      id
      locationUrl
      contentBlocks{
        id
        content
        position
      }
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
mutation AddTaskToCourse($courseUniqueName: String!, $description: String!, $deadline: String!, $maxGrade: Int) {
  addTaskToCourse(courseUniqueName: $courseUniqueName, description: $description, deadline: $deadline, maxGrade: $maxGrade) {
    id
    deadline
    description
    maxGrade
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

export const MODIFY_SUBMISSION = gql`
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

export const GRADE_SUBMISSION = gql`
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

export const ADD_INFO_PAGE_TO_COURSE = gql`
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

export const ADD_CONTENT_BLOCK_TO_INFO_PAGE = gql`
mutation AddContentBlockToInfoPage($courseUniqueName: String!, $content: String!, $position: Int!, $infoPageId: String!) {
  addContentBlockToInfoPage(courseUniqueName: $courseUniqueName, content: $content, position: $position, infoPageId: $infoPageId) {
    content
    id
    position
  }
}
`