
const {server, apolloServer} = require('../../server')
const request = require('supertest')
const Course = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { createCourse, addTaskToCourse, removeCourse, addSubmissionToCourseTask} = require('../courseTestQueries')
const { query } = require('express')
const mongoose = require('mongoose')
const course = require('../../models/course')
const helpers = require('../testHelpers')

beforeAll(async () => {
    await mongoose.connect(config.MONGODB_URI)
    await Course.deleteMany({})
    await User.deleteMany({})
    await request(url).post("/").send({query: userCreateQuery, variables: {}})
    await request(url).post("/").send({query: createSpesificUserQuery, variables:{username: "students username", name: "students name", password: "12345"}})
})

afterAll(async () => {
    
    await Course.deleteMany({})
    await User.deleteMany({})
    await mongoose.connection.close()
})

beforeEach(async () => {
    await Course.deleteMany({})
    await Task.deleteMany({})
    helpers.logOut()
})


describe('addSubmissionToCourseTask tests', () => {
    test('user can create a submission to a task', async () => {
        const userQuery = await User.findOne({username: "username"})
        const userid = userQuery._id.toString()
        apolloServer.context = {userForToken: {username: "username", name:"name", id: userid}}
        const course = {uniqueName: "course-owned-by-username", name: "common name", teacher: "username", tasks: []}
        const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: course})
        const task = {
            description:  "this is the description of a task that is about testing",
            deadline: new Date("2030-06-25"),
            submissions: []
        }
       
        const createdTask = await apolloServer.executeOperation({query: addTaskToCourse, variables: {courseUniqueName: course.uniqueName, description: task.description, deadline: task.deadline.toString()}});
        const taskID = createdTask.data.addTaskToCourse.id

        const submission = {
            content : "this is the answer to a task",
            submitted: true,
            taskId: taskID
        }
        
        const response = await apolloServer.executeOperation({query: addSubmissionToCourseTask, 
            variables: {
            courseUniqueName: course.uniqueName, 
            taskId: submission.taskId,
            content: submission.content, 
            submitted: submission.submitted,
        }});
        
      
        
        const createdSubmission = response.data.addSubmissionToCourseTask
        expect(createdSubmission.content).toEqual(submission.content)
        expect(createdSubmission.submitted).toEqual(submission.submitted)
        expect(createdSubmission.fromUser.username).toEqual("username")
        expect(createdSubmission.fromUser.name).toEqual("name")
     
        expect(new Date(Number(createdSubmission.submittedDate)).toISOString().slice(0, 16)).toEqual(new Date(Date.now()).toISOString().slice(0, 16))
       
        
        const courseInDB = await Course.findOne({courseUniqueName: course.uniqueName}).populate('tasks')
        expect(courseInDB.tasks[0].description).toEqual(task.description)
        expect(courseInDB.tasks[0].deadline).toEqual(task.deadline)
        
        expect(courseInDB.tasks[0].submissions.length).toBe(1)
        expect(courseInDB.tasks[0].submissions[0].content).toEqual(submission.content)
        expect(courseInDB.tasks[0].submissions[0].submitted).toEqual(submission.submitted)
        expect(courseInDB.tasks[0].submissions[0].fromUser.toString()).toEqual(userid)
        expect(new Date(courseInDB.tasks[0].submissions[0].submittedDate).toISOString().slice(0, 16)).toEqual(new Date(Date.now()).toISOString().slice(0, 16))
    })
    test('user can create a submission to a task only once', async () => {
        const userQuery = await User.findOne({username: "username"})
        const userid = userQuery._id.toString()
        apolloServer.context = {userForToken: {username: userQuery.username, name: userQuery.name, id: userid, _id: userQuery._id}}
        const course = {uniqueName: "course-owned-by-username", name: "common name", teacher: "username", tasks: []}
        const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: course})
        const task = {
            description:  "this is the description of a task that is about testing",
            deadline: new Date("2030-06-25"),
            submissions: []
        }
       
        const createdTask = await apolloServer.executeOperation({query: addTaskToCourse, variables: {courseUniqueName: course.uniqueName, description: task.description, deadline: task.deadline.toString()}});
        const taskID = createdTask.data.addTaskToCourse.id

        const submission = {
            content : "this is the answer to a task",
            submitted: true,
            taskId: taskID
        }
        
        const response = await apolloServer.executeOperation({query: addSubmissionToCourseTask, 
            variables: {
            courseUniqueName: course.uniqueName, 
            taskId: submission.taskId,
            content: submission.content, 
            submitted: submission.submitted,
        }});
        const createdSubmission = response.data.addSubmissionToCourseTask
        expect(createdSubmission.content).toEqual(submission.content)
        expect(createdSubmission.submitted).toEqual(submission.submitted)
        expect(createdSubmission.fromUser.username).toEqual("username")
        expect(createdSubmission.fromUser.name).toEqual("name")
        
        const secondSubmission = {
            content : "this is the second answer to a task by the same user",
            submitted: true,
            taskId: taskID
        }
        const secondResponse = await apolloServer.executeOperation({query: addSubmissionToCourseTask, variables: {
            courseUniqueName: course.uniqueName,
            taskId: secondSubmission.taskId,
            content: secondSubmission.content,
            submitted: secondSubmission.submitted
        }})
        expect(secondResponse.errors[0].message).toEqual("Given user is has already answered the question")
        expect(secondResponse.data.addSubmissionToCourseTask).toBe(null)


        const courseInDB = await Course.findOne({courseUniqueName: course.uniqueName}).populate('tasks')
        expect(courseInDB.tasks[0].description).toEqual(task.description)
        expect(courseInDB.tasks[0].deadline).toEqual(task.deadline)
        
        expect(courseInDB.tasks[0].submissions.length).toBe(1)
        expect(courseInDB.tasks[0].submissions[0].content).toEqual(submission.content)
        expect(courseInDB.tasks[0].submissions[0].submitted).toEqual(submission.submitted)
        expect(courseInDB.tasks[0].submissions[0].fromUser.toString()).toEqual(userid)
    })
})