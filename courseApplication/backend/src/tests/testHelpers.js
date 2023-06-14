
const request = require('supertest')
const User = require('../models/user')
const testQueries = require('./courseTestQueries')
const { userLogInQuery } = require('./userTestQueries')
const url = "http://localhost:4000/"
let token = null
const logIn = async (username, password="12345", apolloServer) => {
    
    const tokenReq = await request(url).post("/").send({query: userLogInQuery, variables: {username: username, password: password}})
  
    token = tokenReq.body.data.logIn.value
   
    const userQuery = await User.findOne({username: username})
    return userQuery
}

const logOut = () => {
    token = null
}
const makeQuery = async (args) => {
    console.log(token)
    const result = await request(url).post("/").send(args).set("Authorization", "bearer " + token)
    return result.body
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

const createChatRoom = async (course,name , apolloServer) => {
    const chatRoomQuery = await apolloServer.executeOperation({query: testQueries.createChatRoom, variables: {courseUniqueName: course.uniqueName, name: name}})
    const chatRoom = chatRoomQuery.data.createChatRoom
    return chatRoom
}
module.exports = {
    logIn, 
    logOut,
    createCourse, 
    createTask, 
    createSubmission, 
    createInfoPage,
    createContentBlock,
    createChatRoom,
    makeQuery,
}