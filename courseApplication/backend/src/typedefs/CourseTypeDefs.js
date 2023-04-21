const { gql } = require("apollo-server");
const CourseTypeDefs = gql`
type Task{
    id: ID!
    description: String!
    deadline: String!
    submissions: [Submission!]!
}


type Submission{
    id: ID!
    fromUser: User!
    content: String!
    submitted: Boolean!
    submittedDate: String
}



type Course{
    id: ID!
    uniqueName: String!
    name: String!
    teacher: User!
    students: [User!]!
    tasks: [Task!]
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

    removeCourse(
        uniqueName: String!
    ):Boolean

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
    ):Task
    
    removeTaskFromCourse(
        courseUniqueName: String!
        taskId: String!
    ):Boolean
    

    removeSubmissionFromCourseTask(
        courseUniqueName: String!
        taskId: String!
        submissionId: String!
    ):Boolean

    addSubmissionToCourseTask(
        courseUniqueName: String!
        taskId: String!
        content: String!
        submitted: Boolean!
    ):Submission
}
`

module.exports = {CourseTypeDefs}