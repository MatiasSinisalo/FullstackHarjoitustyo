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

module.exports = {createCourse}

