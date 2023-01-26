const { gql } = require("apollo-server");

const typeDefs = gql`
    type User{
        username: String!
        name: String!
    }

    type Token{
        value: String!
    }

    type Course{
        uniqueName: String!
        name: String!
        teacher: User!
        students: [User!]!
    }

    type Query{
        allUsers: [User!]!
        allCourses: [Course!]!
        getCourse(
            uniqueName: String!
        ):Course
        me: User!
    }

    type Mutation{
        createUser(
            username: String!
            name: String!
            password: String!
        ):User

        logIn(
            username: String!
            password: String!
        ):Token

        createCourse(
            uniqueName: String!
            name: String!
            teacher: String
        ):Course

        addStudentToCourse(
            username: String!
            courseUniqueName: String!
        ):Course

        removeStudentFromCourse(
            username: String!
            courseUniqueName: String!
        ):Course

        reset:Boolean
    }

`

module.exports = typeDefs