const { gql } = require("apollo-server");
const CourseTypeDefs = gql`
type Task{
    id: ID!
    description: String!
    deadline: String!
    submissions: [Submission!]!
    maxGrade: Int
}

type Grade{
    id: ID!
    points: Int!
    date: String
}

type Submission{
    id: ID!
    fromUser: User!
    content: String!
    grade: Grade
    submitted: Boolean!
    submittedDate: String
}

type ContentBlock{
    id: ID!
    content: String!
    position: Int!
}
type InfoPage{
    id: ID!
    locationUrl: String!
    contentBlocks: [ContentBlock!]!
}

type Course{
    id: ID!
    uniqueName: String!
    name: String!
    teacher: User!
    students: [User!]!
    tasks: [Task!]
    infoPages: [InfoPage!]!
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

    addInfoPageToCourse(
        locationUrl: String!
        courseUniqueName: String!
    ):InfoPage

    removeInfoPageFromCourse(
        courseUniqueName: String!
        infoPageId: String!
    ):Boolean

    addContentBlockToInfoPage(
        courseUniqueName: String!
        infoPageId : String!
        content: String!
        position: Int!
    ):ContentBlock
    
    modifyContentBlock(
        courseUniqueName: String!
        infoPageId: String!
        contentBlockId: String!
        content: String!
    ):ContentBlock

    removeContentBlockFromInfoPage(
        courseUniqueName: String!
        infoPageId: String!
        contentBlockId: String!
    ):Boolean

    addTaskToCourse(
        courseUniqueName: String!
        description: String!
        deadline: String!
        maxGrade: Int
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

    modifySubmission(
        courseUniqueName: String!
        taskId: String!
        submissionId: String!
        content: String!
        submitted: Boolean!
    ):Submission

    gradeSubmission(
        courseUniqueName: String!
        taskId: String!
        submissionId: String!
        points: Int!
    ):Submission
}
`

module.exports = {CourseTypeDefs}