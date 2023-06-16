const {server, apolloServer} = require('../../server')
const request = require('supertest')
const Course = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { createCourse, addTaskToCourse, addStudentToCourse, addSubmissionToCourseTask, removeSubmissionFromCourseTask, modifySubmission} = require('../courseTestQueries')
const { query } = require('express')
const mongoose = require('mongoose')
const course = require('../../models/course')
const helpers = require('../testHelpers')
const config = require('../../config')

beforeAll(async () => {
    await mongoose.connect(config.MONGODB_URI)
    await Course.deleteMany({})
    await User.deleteMany({})
    await request(config.LOCAL_SERVER_URL).post("/").send({query: userCreateQuery, variables: {}})
    await request(config.LOCAL_SERVER_URL).post("/").send({query: createSpesificUserQuery, variables:{username: "students username", name: "students name", password: "12345"}})
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


describe('modify submission tests', () => {
    test('user can modify a submission made by the user', async () => {
        const user = await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
        const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
        const submission = await helpers.createSubmission(course, task.id, "this is an answer", false, apolloServer);


        const newContent = "this is modified content"
        const newSubmitted = true
        const modifySubmissionQuery = await helpers.makeQuery({query: modifySubmission, 
            variables: 
            {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id, content: newContent, submitted: newSubmitted}})
     
        const returnedModifiedSubmission = modifySubmissionQuery.data.modifySubmission
        expect(returnedModifiedSubmission.content).toEqual(newContent)
        expect(returnedModifiedSubmission.submitted).toEqual(newSubmitted)
        expect(returnedModifiedSubmission.fromUser).toEqual({username: user.username, name: user.name, id: user.id})
        
        const courseInDB = await Course.findOne({uniqueName: "course-unique-name"})
        const tasks = courseInDB.tasks
        expect(tasks.length).toBe(1)
        expect(tasks[0].submissions.length).toBe(1)
        
        const submissionInDB = tasks[0].submissions[0]
        expect(submissionInDB.content).toEqual(newContent)
        expect(submissionInDB.submitted).toEqual(newSubmitted)
        expect(submissionInDB.fromUser.toString()).toEqual(user.id)


    })

    test('user can not modify a returned submission', async () => {
        const user = await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
        const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
        const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);


        const newContent = "this is modified content"
        const newSubmitted = false
        const modifySubmissionQuery = await helpers.makeQuery({query: modifySubmission, 
            variables: 
            {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id, content: newContent, submitted: newSubmitted}})
     
        expect(modifySubmissionQuery.errors[0].message).toEqual("This submission has already been returned")
        expect(modifySubmissionQuery.data.modifySubmission).toEqual(null)
        
        const courseInDB = await Course.findOne({uniqueName: "course-unique-name"})
        const tasks = courseInDB.tasks
        expect(tasks.length).toBe(1)
        expect(tasks[0].submissions.length).toBe(1)
        
        const submissionInDB = tasks[0].submissions[0]
        expect(submissionInDB.content).toEqual(submission.content)
        expect(submissionInDB.submitted).toEqual(submission.submitted)
        expect(submissionInDB.fromUser.toString()).toEqual(user.id)


    })
    test('user can not modify a submission made by another user', async () => {
        const user = await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
        const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
        const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);

        const anotherUser = await helpers.logIn("students username", apolloServer)
        const newContent = "this is modified content"
        const newSubmitted = false
        const modifySubmissionQuery = await helpers.makeQuery({query: modifySubmission, 
            variables: 
            {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id, content: newContent, submitted: newSubmitted}})
        expect(modifySubmissionQuery.errors[0].message).toEqual("Unauthorized")
        expect(modifySubmissionQuery.data.modifySubmission).toEqual(null)
        
        const courseInDB = await Course.findOne({uniqueName: "course-unique-name"})
        const tasks = courseInDB.tasks
        expect(tasks.length).toBe(1)
        expect(tasks[0].submissions.length).toBe(1)
        
        const submissionInDB = tasks[0].submissions[0]
        expect(submissionInDB.content).toEqual(submission.content)
        expect(submissionInDB.submitted).toEqual(submission.submitted)
        expect(submissionInDB.fromUser.toString()).toEqual(submission.fromUser.id)


    })
    test('user must be logged in to modify a submission', async () => {
        const user = await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
        const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
        const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);

        helpers.logOut()
        const newContent = "this is modified content"
        const newSubmitted = false
        const modifySubmissionQuery = await helpers.makeQuery({query: modifySubmission, 
            variables: 
            {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id, content: newContent, submitted: newSubmitted}})
        expect(modifySubmissionQuery.errors[0].message).toEqual("Unauthorized")
        expect(modifySubmissionQuery.data.modifySubmission).toEqual(null)
        
        const courseInDB = await Course.findOne({uniqueName: "course-unique-name"})
        const tasks = courseInDB.tasks
        expect(tasks.length).toBe(1)
        expect(tasks[0].submissions.length).toBe(1)
        
        const submissionInDB = tasks[0].submissions[0]
        expect(submissionInDB.content).toEqual(submission.content)
        expect(submissionInDB.submitted).toEqual(submission.submitted)
        expect(submissionInDB.fromUser.toString()).toEqual(submission.fromUser.id)


    })

    test('modify submission returns course not found if given course is not found', async () => {
        const user = await helpers.logIn("username", apolloServer)
        
        const newContent = "this is modified content"
        const newSubmitted = false
        const modifySubmissionQuery = await helpers.makeQuery({query: modifySubmission, 
            variables: 
            {courseUniqueName: "course does not exist", taskId: "abc1234", submissionId: "abc43231", content: newContent, submitted: newSubmitted}})
        
        expect(modifySubmissionQuery.errors[0].message).toEqual("Given course not found")

        const courses = await Course.find({})
        expect(courses).toEqual([])
    })  

    test('modify submission returns task not found if given task is not found', async () => {
        const user = await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)


        const anotherCourse = await helpers.createCourse("second-course-unique-name", "name of course", [], apolloServer)
        const taskOnAnotherCourse = await  helpers.createTask(anotherCourse, "this is a task in another course", new Date(Date.now()), [], apolloServer)
      

        const newContent = "this is modified content"
        const newSubmitted = false
        const modifySubmissionQuery = await helpers.makeQuery({query: modifySubmission, 
            variables: 
            {courseUniqueName: course.uniqueName, taskId: taskOnAnotherCourse.id, submissionId: "abc43231", content: newContent, submitted: newSubmitted}})
        
        expect(modifySubmissionQuery.errors[0].message).toEqual("Given task not found")

        const courseInDB = await Course.findOne({uniqueName: course.uniqueName})
        expect(courseInDB.tasks).toEqual(course.tasks)

        const anotherCourseInDB = await Course.findOne({uniqueName: anotherCourse.uniqueName})
       
        expect(anotherCourseInDB.tasks.length).toEqual(1)
        expect(anotherCourseInDB.tasks[0].submissions.length).toEqual(0)
    })  


    test('modify submission returns submission not found if given submission is not found', async () => {
        const user = await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
        const task = await  helpers.createTask(course, "this is a task in course", new Date(Date.now()), [], apolloServer)
        const wrongSubmssionOnCourse = await helpers.createSubmission(course, task.id, "this is an answer that should not be modified", true, apolloServer);


        const anotherCourse = await helpers.createCourse("second-course-unique-name", "name of course", [], apolloServer)
        const taskOnAnotherCourse = await  helpers.createTask(anotherCourse, "this is a task in another course", new Date(Date.now()), [], apolloServer)
        const submissionOnAnotherTask = await helpers.createSubmission(anotherCourse, taskOnAnotherCourse.id, "this is an answer", true, apolloServer);


        const newContent = "this is modified content"
        const newSubmitted = false
        const modifySubmissionQuery = await helpers.makeQuery({query: modifySubmission, 
            variables: 
            {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submissionOnAnotherTask.id, content: newContent, submitted: newSubmitted}})
        
        expect(modifySubmissionQuery.errors[0].message).toEqual("Given submission not found")

        const courseInDB = await Course.findOne({uniqueName: course.uniqueName})
        expect(courseInDB.tasks.length).toEqual(1)
        expect(courseInDB.tasks[0].submissions.length).toEqual(1)
        expect(courseInDB.tasks[0].submissions[0].content).toEqual(wrongSubmssionOnCourse.content)    
        expect(courseInDB.tasks[0].submissions[0].submitted).toEqual(wrongSubmssionOnCourse.submitted)    

        const anotherCourseInDB = await Course.findOne({uniqueName: anotherCourse.uniqueName})
        
        expect(anotherCourseInDB.tasks.length).toEqual(1)
        expect(anotherCourseInDB.tasks[0].submissions.length).toEqual(1)
        expect(anotherCourseInDB.tasks[0].submissions[0].content).toEqual(submissionOnAnotherTask.content)    
        expect(anotherCourseInDB.tasks[0].submissions[0].submitted).toEqual(submissionOnAnotherTask.submitted)    

    })  
})
