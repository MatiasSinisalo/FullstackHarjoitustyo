const { gql } = require("apollo-server");
const CourseTypeDefs = gql`
type Task{
    id: String!
    description: String!
    deadline: String
    submissions: [Submission!]!
}


type Submission{
    id: String!
    fromUser: User!
    content: String!
    submitted: Boolean!
}



type Course{
    id: String!
    uniqueName: String!
    name: String!
    teacher: User!
    students: [User!]!
    tasks: [Task!]!
}

type Query{
    allCourses: [Course!]!
    getCourse(
        uniqueName: String!
    ):Course
}

type Mutation{
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

    addTaskToCourse(
        courseUniqueName: String!
        description: String!
        deadline: String!
    ):Course
}
`

module.exports = {CourseTypeDefs}