const {server, apolloServer} = require('../../server')
const request = require('supertest')
const Course = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { createCourse, addTaskToCourse, addStudentToCourse, addSubmissionToCourseTask, removeSubmissionFromCourseTask} = require('../courseTestQueries')
const { query } = require('express')
const mongoose = require('mongoose')
const course = require('../../models/course')
const helpers = require('../testHelpers')

beforeAll(async () => {
    await server.start("test server ready")
    await Course.deleteMany({})
    await User.deleteMany({})
    await apolloServer.executeOperation({query: userCreateQuery, variables:{}})
    await apolloServer.executeOperation({query: createSpesificUserQuery, variables:{username: "students username", name: "students name", password: "1234"}})
})

afterAll(async () => {
    await Course.deleteMany({})
    await User.deleteMany({})
    await server.stop()
})

beforeEach(async () => {
    apolloServer.context = {}
    await Course.deleteMany({})
    await Task.deleteMany({})
})

describe('removeSubmissionFromCourseTask tests', () => {
    test('removeSubmissionFromCourseTask modifies database state correctly when a task has one submission', async () => {
        const userQuery = await User.findOne({username: "username"})
        apolloServer.context = {userForToken: userQuery}
        const course = {uniqueName: "course-owned-by-username", name: "common name", teacher: "username", tasks: []}
        const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: course})
        expect(createdCourse.data.createCourse).toBeDefined()

        const task = {
            description:  "this is the description of a task that is about testing",
            deadline: new Date("2030-06-25"),
            submissions: []
        }
        const createdTask = await apolloServer.executeOperation({query: addTaskToCourse, variables: {courseUniqueName: course.uniqueName, description: task.description, deadline: task.deadline.toString()}});
        const taskID = createdTask.data.addTaskToCourse.id

        const submission = {
            content : "this is the answer to a task and should be removed",
            submitted: true,
            taskId: taskID
        }
        const submissionCreateQuery = await apolloServer.executeOperation({query: addSubmissionToCourseTask, 
            variables: {
            courseUniqueName: course.uniqueName, 
            taskId: submission.taskId,
            content: submission.content, 
            submitted: submission.submitted,
        }});
        const submissionID = submissionCreateQuery.data.addSubmissionToCourseTask.id
       
        const removedQuery = await apolloServer.executeOperation({query: removeSubmissionFromCourseTask, variables: {courseUniqueName: course.uniqueName, taskId: taskID,  submissionId: submissionID}})
        expect(removedQuery.data.removeSubmissionFromCourseTask).toBe(true)
        const courseInDB = await Course.findOne({uniqueName: course.uniqueName})
        const taskInDB = courseInDB.tasks[0]
        expect(taskInDB.submissions.length).toBe(0)


    })
    test('removeSubmissionFromCourseTask modifies database state correctly when a task has 2 submissions', async () => {
        const userQuery = await User.findOne({username: "username"})
        apolloServer.context = {userForToken: userQuery}
        const course = {uniqueName: "course-owned-by-username", name: "common name", teacher: "username", tasks: []}
        const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: course})
        expect(createdCourse.data.createCourse).toBeDefined()

        const task = {
            description:  "this is the description of a task that is about testing",
            deadline: new Date("2030-06-25"),
            submissions: []
        }
        const createdTask = await apolloServer.executeOperation({query: addTaskToCourse, variables: {courseUniqueName: course.uniqueName, description: task.description, deadline: task.deadline.toString()}});
       
        const taskID = createdTask.data.addTaskToCourse.id
       
        const otherUserQuery = await User.findOne({username: "students username"})
        apolloServer.context = {userForToken: otherUserQuery}
        await apolloServer.executeOperation({query: addStudentToCourse, variables: {courseUniqueName: "course-owned-by-username", addStudentToCourseUsername: "students username"}})
       
        const submissionToNotBeRemoved = {
            content : "this is the answer to a task and should not be removed",
            submitted: true,
            taskId: taskID
        }
        await apolloServer.executeOperation({query: addSubmissionToCourseTask, 
            variables: {
            courseUniqueName: course.uniqueName, 
            taskId: submissionToNotBeRemoved.taskId,
            content: submissionToNotBeRemoved.content, 
            submitted: submissionToNotBeRemoved.submitted,
        }});
    
        apolloServer.context = {userForToken: userQuery}

        const submission = {
            content : "this is the answer to a task and should be removed",
            submitted: true,
            taskId: taskID
        }
        const submissionCreateQuery = await apolloServer.executeOperation({query: addSubmissionToCourseTask, 
            variables: {
            courseUniqueName: course.uniqueName, 
            taskId: submission.taskId,
            content: submission.content, 
            submitted: submission.submitted,
        }});
        const submissionID = submissionCreateQuery.data.addSubmissionToCourseTask.id
       
        const removedQuery = await apolloServer.executeOperation({query: removeSubmissionFromCourseTask, variables: {courseUniqueName: course.uniqueName, taskId: taskID,  submissionId: submissionID}})
        expect(removedQuery.data.removeSubmissionFromCourseTask).toBe(true)
        const courseInDB = await Course.findOne({uniqueName: course.uniqueName})
        const taskInDB = courseInDB.tasks[0]
        expect(taskInDB.submissions.length).toBe(1)
     
        expect(taskInDB.submissions[0].fromUser.toString()).toEqual(otherUserQuery.id)
        expect(taskInDB.submissions[0].content).toEqual("this is the answer to a task and should not be removed")

    })

    test('removeSubmissionFromCourseTask student can not remove other students submission', async () => {
        await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
        const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
        const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);
        
        await helpers.logIn("students username", apolloServer)
        const removedQuery = await apolloServer.executeOperation({query: removeSubmissionFromCourseTask, 
            variables: {courseUniqueName: course.uniqueName, taskId: task.id,  submissionId: submission.id}})
        expect(removedQuery.errors[0].message).toEqual("Unauthorized")
        expect(removedQuery.data.removeSubmissionFromCourseTask).toEqual(null)
        
        const courseInDB = await Course.findOne({uniqueName: "course-unique-name"})
        expect(courseInDB.tasks[0].submissions.length).toBe(1)
        expect(courseInDB.tasks[0].submissions[0].content).toEqual(submission.content)
        expect(courseInDB.tasks[0].submissions[0].fromUser.toString()).toEqual(submission.fromUser.id)
    })

    test('removeSubmissionFromCourseTask teacher can remove students submission', async () => {
        await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
        const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
         
        await helpers.logIn("students username", apolloServer)
        await apolloServer.executeOperation({query: addStudentToCourse, variables: {courseUniqueName: "course-unique-name", addStudentToCourseUsername: "students username"}})
        const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);
      
        await helpers.logIn("username", apolloServer)
        const removedQuery = await apolloServer.executeOperation({query: removeSubmissionFromCourseTask, 
            variables: {courseUniqueName: course.uniqueName, taskId: task.id,  submissionId: submission.id}})
        expect(removedQuery.data.removeSubmissionFromCourseTask).toEqual(true)
        
        const courseInDB = await Course.findOne({uniqueName: "course-unique-name"})
        expect(courseInDB.tasks[0].submissions.length).toBe(0)
    })

    test('removeSubmissionFromCourseTask returns course not found if course does not exist', async () => {
        await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
        const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
        const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);
      
       
        const removedQuery = await apolloServer.executeOperation({query: removeSubmissionFromCourseTask, 
            variables: {courseUniqueName: "this course does not exist", taskId: task.id,  submissionId: submission.id}})
       
        expect(removedQuery.errors[0].message).toEqual("Given course not found")
        expect(removedQuery.data.removeSubmissionFromCourseTask).toEqual(null)
        
        const courseInDB = await Course.findOne({uniqueName: "course-unique-name"})
        expect(courseInDB.tasks[0].submissions.length).toBe(1)
        expect(courseInDB.tasks[0].submissions[0].content).toEqual(submission.content)
        expect(courseInDB.tasks[0].submissions[0].fromUser.toString()).toEqual(submission.fromUser.id)
    })

    test('removeSubmissionFromCourseTask returns task not found if task does not exist', async () => {
        await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
        const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
        const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);
      
        const anotherCourse = await helpers.createCourse("second course", "name of course", [], apolloServer)
        const anotherTask = await  helpers.createTask(anotherCourse, "this is a different task", new Date(Date.now()), [], apolloServer)
        const differentSubmission = await helpers.createSubmission(anotherCourse, anotherTask.id, "this is an different answer", true, apolloServer);
    

        const removedQuery = await apolloServer.executeOperation({query: removeSubmissionFromCourseTask, 
            variables: {courseUniqueName: "course-unique-name", taskId: anotherTask.id,  submissionId: submission.id}})
      
        expect(removedQuery.errors[0].message).toEqual("Given task not found")
        expect(removedQuery.data.removeSubmissionFromCourseTask).toEqual(null)
        
        const courseInDB = await Course.findOne({uniqueName: "course-unique-name"})
        expect(courseInDB.tasks[0].submissions.length).toBe(1)
        expect(courseInDB.tasks[0].submissions[0].content).toEqual(submission.content)
        expect(courseInDB.tasks[0].submissions[0].fromUser.toString()).toEqual(submission.fromUser.id)

        const secondCourseInDB = await Course.findOne({uniqueName: "second course"})
        expect(secondCourseInDB.tasks[0].submissions.length).toBe(1)
        expect(secondCourseInDB.tasks[0].submissions[0].content).toEqual(differentSubmission.content)
        expect(secondCourseInDB.tasks[0].submissions[0].fromUser.toString()).toEqual(differentSubmission.fromUser.id)
    })

    test('removeSubmissionFromCourseTask returns submission not found if submission does not exist', async () => {
        await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
        const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
        const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);
      
        const anotherCourse = await helpers.createCourse("second course", "name of course", [], apolloServer)
        const anotherTask = await  helpers.createTask(anotherCourse, "this is a different task", new Date(Date.now()), [], apolloServer)
        const differentSubmission = await helpers.createSubmission(anotherCourse, anotherTask.id, "this is an different answer", true, apolloServer);
    

        const removedQuery = await apolloServer.executeOperation({query: removeSubmissionFromCourseTask, 
            variables: {courseUniqueName: "course-unique-name", taskId: task.id,  submissionId: differentSubmission.id}})
      
        expect(removedQuery.errors[0].message).toEqual("Given submission not found")
        expect(removedQuery.data.removeSubmissionFromCourseTask).toEqual(null)
        
        const courseInDB = await Course.findOne({uniqueName: "course-unique-name"})
        expect(courseInDB.tasks[0].submissions.length).toBe(1)
        expect(courseInDB.tasks[0].submissions[0].content).toEqual(submission.content)
        expect(courseInDB.tasks[0].submissions[0].fromUser.toString()).toEqual(submission.fromUser.id)

        const secondCourseInDB = await Course.findOne({uniqueName: "second course"})
        expect(secondCourseInDB.tasks[0].submissions.length).toBe(1)
        expect(secondCourseInDB.tasks[0].submissions[0].content).toEqual(differentSubmission.content)
        expect(secondCourseInDB.tasks[0].submissions[0].fromUser.toString()).toEqual(differentSubmission.fromUser.id)
    })


})