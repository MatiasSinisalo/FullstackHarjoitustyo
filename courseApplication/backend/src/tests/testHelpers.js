const User = require('../models/user')
const testQueries = require('./courseTestQueries')

const logIn = async (username, apolloServer) => {
    const userQuery = await User.findOne({username: username})
    apolloServer.context = {userForToken: userQuery}
    return userQuery
}

const createCourse = async (uniqueName, name, tasks, apolloServer) => {
    const course = {uniqueName: uniqueName, name: name, teacher: "", tasks: tasks}
    const createdCourse = await apolloServer.executeOperation({query: testQueries.createCourse, variables: course})
    return createdCourse.data.createCourse
}

const createTask = async (course, description, deadline, submissions, apolloServer) => {
    const task = {
        description:  "this is the description of a task that is about testing",
        deadline: new Date("2030-06-25"),
        submissions: []
    }
    const createdTask = await apolloServer.executeOperation({query: testQueries.addTaskToCourse, variables: {courseUniqueName: course.uniqueName, description: task.description, deadline: task.deadline.toString()}});
    return createdTask.data.addTaskToCourse
}

const createSubmission = async (course, taskId, content, submitted, apolloServer) => {
    const submissionToNotBeRemoved = {
        content : content,
        submitted: submitted,
        taskId: taskId
    }
    const submission = await apolloServer.executeOperation({query: testQueries.addSubmissionToCourseTask, 
        variables: {
        courseUniqueName: course.uniqueName, 
        taskId: submissionToNotBeRemoved.taskId,
        content: submissionToNotBeRemoved.content, 
        submitted: submissionToNotBeRemoved.submitted,
    }});
   
    return submission.data.addSubmissionToCourseTask
}

const createInfoPage = async(course, url, apolloServer) => {
    const infoPageQuery = await apolloServer.executeOperation({query: testQueries.addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: url}})
    const infoPage = infoPageQuery.data.addInfoPageToCourse
    return infoPage
}

const createContentBlock = async (course, infoPage, content, position, apolloServer) => {
   
    
    const contentBlockQuery = await apolloServer.executeOperation({query: testQueries.addContentBlockToInfoPage, variables: {
        courseUniqueName: course.uniqueName, 
        infoPageId: infoPage.id, 
        content: content,
        position: position
    }})
    return contentBlockQuery.data.addContentBlockToInfoPage
}
module.exports = {logIn, createCourse, createTask, createSubmission, createInfoPage, createContentBlock}