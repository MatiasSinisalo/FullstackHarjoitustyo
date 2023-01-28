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


const addStudentToCourse = `mutation AddStudentToCourse($addStudentToCourseUsername2: String!, $courseUniqueName: String!) {
  addStudentToCourse(username: $addStudentToCourseUsername2, courseUniqueName: $courseUniqueName) {
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

module.exports = {createCourse, addStudentToCourse}

