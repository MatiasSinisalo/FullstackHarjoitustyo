const {server, apolloServer} = require('../server')
const request = require('supertest')
const Course = require('../models/course')
const User = require('../models/user')
const {Task} = require('../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('./userTestQueries')
const { createCourse, addStudentToCourse, removeStudentFromCourse, addTaskToCourse, addSubmissionToCourseTask, getAllCourses, removeCourse, getCourse, removeTaskFromCourse, removeSubmissionFromCourseTask, modifySubmission, gradeSubmission, addInfoPageOnCourse, addContentBlockToInfoPage } = require('./courseTestQueries')
const { query } = require('express')
const mongoose = require('mongoose')
const course = require('../models/course')
const helpers = require('./testHelpers')

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

describe('course tests', () => {




    

    describe('removeSubmissionFromCourseTask tests', () => {
        test('removeSubmissionFromCourseTask modifies database state correctly when a task has one submission', async () => {
            const userQuery = await User.findOne({username: "username"})
            apolloServer.context = {userForToken: userQuery}
            const course = {uniqueName: "course owned by username", name: "common name", teacher: "username", tasks: []}
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
            const course = {uniqueName: "course owned by username", name: "common name", teacher: "username", tasks: []}
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
            await apolloServer.executeOperation({query: addStudentToCourse, variables: {courseUniqueName: "course owned by username", addStudentToCourseUsername: "students username"}})
           
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
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);
            
            await helpers.logIn("students username", apolloServer)
            const removedQuery = await apolloServer.executeOperation({query: removeSubmissionFromCourseTask, 
                variables: {courseUniqueName: course.uniqueName, taskId: task.id,  submissionId: submission.id}})
            expect(removedQuery.errors[0].message).toEqual("Unauthorized")
            expect(removedQuery.data.removeSubmissionFromCourseTask).toEqual(null)
            
            const courseInDB = await Course.findOne({uniqueName: "course unique name"})
            expect(courseInDB.tasks[0].submissions.length).toBe(1)
            expect(courseInDB.tasks[0].submissions[0].content).toEqual(submission.content)
            expect(courseInDB.tasks[0].submissions[0].fromUser.toString()).toEqual(submission.fromUser.id)
        })

        test('removeSubmissionFromCourseTask teacher can remove students submission', async () => {
            await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
             
            await helpers.logIn("students username", apolloServer)
            await apolloServer.executeOperation({query: addStudentToCourse, variables: {courseUniqueName: "course unique name", addStudentToCourseUsername: "students username"}})
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);
          
            await helpers.logIn("username", apolloServer)
            const removedQuery = await apolloServer.executeOperation({query: removeSubmissionFromCourseTask, 
                variables: {courseUniqueName: course.uniqueName, taskId: task.id,  submissionId: submission.id}})
            expect(removedQuery.data.removeSubmissionFromCourseTask).toEqual(true)
            
            const courseInDB = await Course.findOne({uniqueName: "course unique name"})
            expect(courseInDB.tasks[0].submissions.length).toBe(0)
        })

        test('removeSubmissionFromCourseTask returns course not found if course does not exist', async () => {
            await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);
          
           
            const removedQuery = await apolloServer.executeOperation({query: removeSubmissionFromCourseTask, 
                variables: {courseUniqueName: "this course does not exist", taskId: task.id,  submissionId: submission.id}})
           
            expect(removedQuery.errors[0].message).toEqual("Given course not found")
            expect(removedQuery.data.removeSubmissionFromCourseTask).toEqual(null)
            
            const courseInDB = await Course.findOne({uniqueName: "course unique name"})
            expect(courseInDB.tasks[0].submissions.length).toBe(1)
            expect(courseInDB.tasks[0].submissions[0].content).toEqual(submission.content)
            expect(courseInDB.tasks[0].submissions[0].fromUser.toString()).toEqual(submission.fromUser.id)
        })

        test('removeSubmissionFromCourseTask returns task not found if task does not exist', async () => {
            await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);
          
            const anotherCourse = await helpers.createCourse("second course", "name of course", [], apolloServer)
            const anotherTask = await  helpers.createTask(anotherCourse, "this is a different task", new Date(Date.now()), [], apolloServer)
            const differentSubmission = await helpers.createSubmission(anotherCourse, anotherTask.id, "this is an different answer", true, apolloServer);
        

            const removedQuery = await apolloServer.executeOperation({query: removeSubmissionFromCourseTask, 
                variables: {courseUniqueName: "course unique name", taskId: anotherTask.id,  submissionId: submission.id}})
          
            expect(removedQuery.errors[0].message).toEqual("Given task not found")
            expect(removedQuery.data.removeSubmissionFromCourseTask).toEqual(null)
            
            const courseInDB = await Course.findOne({uniqueName: "course unique name"})
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
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);
          
            const anotherCourse = await helpers.createCourse("second course", "name of course", [], apolloServer)
            const anotherTask = await  helpers.createTask(anotherCourse, "this is a different task", new Date(Date.now()), [], apolloServer)
            const differentSubmission = await helpers.createSubmission(anotherCourse, anotherTask.id, "this is an different answer", true, apolloServer);
        

            const removedQuery = await apolloServer.executeOperation({query: removeSubmissionFromCourseTask, 
                variables: {courseUniqueName: "course unique name", taskId: task.id,  submissionId: differentSubmission.id}})
          
            expect(removedQuery.errors[0].message).toEqual("Given submission not found")
            expect(removedQuery.data.removeSubmissionFromCourseTask).toEqual(null)
            
            const courseInDB = await Course.findOne({uniqueName: "course unique name"})
            expect(courseInDB.tasks[0].submissions.length).toBe(1)
            expect(courseInDB.tasks[0].submissions[0].content).toEqual(submission.content)
            expect(courseInDB.tasks[0].submissions[0].fromUser.toString()).toEqual(submission.fromUser.id)

            const secondCourseInDB = await Course.findOne({uniqueName: "second course"})
            expect(secondCourseInDB.tasks[0].submissions.length).toBe(1)
            expect(secondCourseInDB.tasks[0].submissions[0].content).toEqual(differentSubmission.content)
            expect(secondCourseInDB.tasks[0].submissions[0].fromUser.toString()).toEqual(differentSubmission.fromUser.id)
        })


    })
    describe('modify submission tests', () => {
        test('user can modify a submission made by the user', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", false, apolloServer);


            const newContent = "this is modified content"
            const newSubmitted = true
            const modifySubmissionQuery = await apolloServer.executeOperation({query: modifySubmission, 
                variables: 
                {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id, content: newContent, submitted: newSubmitted}})
         
            const returnedModifiedSubmission = modifySubmissionQuery.data.modifySubmission
            expect(returnedModifiedSubmission.content).toEqual(newContent)
            expect(returnedModifiedSubmission.submitted).toEqual(newSubmitted)
            expect(returnedModifiedSubmission.fromUser).toEqual({username: user.username, name: user.name, id: user.id})
            
            const courseInDB = await Course.findOne({uniqueName: "course unique name"})
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
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);


            const newContent = "this is modified content"
            const newSubmitted = false
            const modifySubmissionQuery = await apolloServer.executeOperation({query: modifySubmission, 
                variables: 
                {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id, content: newContent, submitted: newSubmitted}})
         
            expect(modifySubmissionQuery.errors[0].message).toEqual("This submission has already been returned")
            expect(modifySubmissionQuery.data.modifySubmission).toEqual(null)
            
            const courseInDB = await Course.findOne({uniqueName: "course unique name"})
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
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);

            const anotherUser = await helpers.logIn("students username", apolloServer)
            const newContent = "this is modified content"
            const newSubmitted = false
            const modifySubmissionQuery = await apolloServer.executeOperation({query: modifySubmission, 
                variables: 
                {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id, content: newContent, submitted: newSubmitted}})
            expect(modifySubmissionQuery.errors[0].message).toEqual("Unauthorized")
            expect(modifySubmissionQuery.data.modifySubmission).toEqual(null)
            
            const courseInDB = await Course.findOne({uniqueName: "course unique name"})
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
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);

            apolloServer.context = {userForToken: null}
            const newContent = "this is modified content"
            const newSubmitted = false
            const modifySubmissionQuery = await apolloServer.executeOperation({query: modifySubmission, 
                variables: 
                {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id, content: newContent, submitted: newSubmitted}})
            expect(modifySubmissionQuery.errors[0].message).toEqual("Unauthorized")
            expect(modifySubmissionQuery.data.modifySubmission).toEqual(null)
            
            const courseInDB = await Course.findOne({uniqueName: "course unique name"})
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
            const modifySubmissionQuery = await apolloServer.executeOperation({query: modifySubmission, 
                variables: 
                {courseUniqueName: "course does not exist", taskId: "abc1234", submissionId: "abc43231", content: newContent, submitted: newSubmitted}})
            
            expect(modifySubmissionQuery.errors[0].message).toEqual("Given course not found")

            const courses = await Course.find({})
            expect(courses).toEqual([])
        })  

        test('modify submission returns task not found if given task is not found', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)


            const anotherCourse = await helpers.createCourse("second course unique name", "name of course", [], apolloServer)
            const taskOnAnotherCourse = await  helpers.createTask(anotherCourse, "this is a task in another course", new Date(Date.now()), [], apolloServer)
          

            const newContent = "this is modified content"
            const newSubmitted = false
            const modifySubmissionQuery = await apolloServer.executeOperation({query: modifySubmission, 
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
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task in course", new Date(Date.now()), [], apolloServer)
            const wrongSubmssionOnCourse = await helpers.createSubmission(course, task.id, "this is an answer that should not be modified", true, apolloServer);


            const anotherCourse = await helpers.createCourse("second course unique name", "name of course", [], apolloServer)
            const taskOnAnotherCourse = await  helpers.createTask(anotherCourse, "this is a task in another course", new Date(Date.now()), [], apolloServer)
            const submissionOnAnotherTask = await helpers.createSubmission(anotherCourse, taskOnAnotherCourse.id, "this is an answer", true, apolloServer);


            const newContent = "this is modified content"
            const newSubmitted = false
            const modifySubmissionQuery = await apolloServer.executeOperation({query: modifySubmission, 
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

    describe('grade submission tests', () => {
        test('teacher can give a grade', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", false, apolloServer)

            const points = 10
            const gradeSubmissionQuery = await apolloServer.executeOperation({query: gradeSubmission, variables: {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id, points: points}})
            console.log(gradeSubmissionQuery)
            const gradedSubmission = gradeSubmissionQuery.data.gradeSubmission
            expect(gradedSubmission.grade.points).toBe(10)

            const courseInDB = await Course.findOne({uniqueName: course.uniqueName})
            const taskInDB = courseInDB.tasks[0]
            expect(taskInDB.submissions.length).toBe(1)
            
            const submissionInDB = taskInDB.submissions[0]
            expect(submissionInDB.content).toEqual("this is an answer")
            expect(submissionInDB.fromUser.toString()).toEqual(user.id)
            expect(submissionInDB.submitted).toEqual(false)
            expect(submissionInDB.submittedDate).toEqual(null)


            expect(submissionInDB.grade.points).toBe(10)
            const gradingDate = new Date(Number(submissionInDB.grade.date)).toISOString().split('T')[0]
            const today = new Date(Date.now()).toISOString().split('T')[0]
            expect(gradingDate).toEqual(today)
        })

        test('grade submission returns course not found if the Course does not exist', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", false, apolloServer)

            const points = 10
            const gradeSubmissionQuery = await apolloServer.executeOperation({query: gradeSubmission, variables: {courseUniqueName:"this course wont exist", taskId: task.id, submissionId: submission.id, points: points}})
            expect(gradeSubmissionQuery.errors[0].message).toEqual("Given course not found")
            console.log(gradeSubmissionQuery)
            const gradedSubmission = gradeSubmissionQuery.data.gradeSubmission
            expect(gradedSubmission).toBe(null)

            const courseInDB = await Course.findOne({uniqueName: course.uniqueName})
            const taskInDB = courseInDB.tasks[0]
            expect(taskInDB.submissions.length).toBe(1)
            
            const submissionInDB = taskInDB.submissions[0]
            expect(submissionInDB.content).toEqual("this is an answer")
            expect(submissionInDB.fromUser.toString()).toEqual(user.id)
            expect(submissionInDB.submitted).toEqual(false)
            expect(submissionInDB.submittedDate).toEqual(null)

            expect(submissionInDB.grade).toBe(undefined)
        })
        
        test('grade submission returns task not found if the task does not exist', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", false, apolloServer)

            const points = 10
            const gradeSubmissionQuery = await apolloServer.executeOperation({query: gradeSubmission, variables: {courseUniqueName: course.uniqueName, taskId: "incorrectTaskId", submissionId: submission.id, points: points}})
            expect(gradeSubmissionQuery.errors[0].message).toEqual("Given task not found")
            console.log(gradeSubmissionQuery)
            const gradedSubmission = gradeSubmissionQuery.data.gradeSubmission
            expect(gradedSubmission).toBe(null)

            const courseInDB = await Course.findOne({uniqueName: course.uniqueName})
            const taskInDB = courseInDB.tasks[0]
            expect(taskInDB.submissions.length).toBe(1)
            
            const submissionInDB = taskInDB.submissions[0]
            expect(submissionInDB.content).toEqual("this is an answer")
            expect(submissionInDB.fromUser.toString()).toEqual(user.id)
            expect(submissionInDB.submitted).toEqual(false)
            expect(submissionInDB.submittedDate).toEqual(null)

            expect(submissionInDB.grade).toBe(undefined)
        })

        test('grade submission returns submission not found if the submission does not exist', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", false, apolloServer)

            const points = 10
            const gradeSubmissionQuery = await apolloServer.executeOperation({query: gradeSubmission, variables: {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: "incorrectSubmissionId", points: points}})
            expect(gradeSubmissionQuery.errors[0].message).toEqual("Given submission not found")
            console.log(gradeSubmissionQuery)
            const gradedSubmission = gradeSubmissionQuery.data.gradeSubmission
            expect(gradedSubmission).toBe(null)

            const courseInDB = await Course.findOne({uniqueName: course.uniqueName})
            const taskInDB = courseInDB.tasks[0]
            expect(taskInDB.submissions.length).toBe(1)
            
            const submissionInDB = taskInDB.submissions[0]
            expect(submissionInDB.content).toEqual("this is an answer")
            expect(submissionInDB.fromUser.toString()).toEqual(user.id)
            expect(submissionInDB.submitted).toEqual(false)
            expect(submissionInDB.submittedDate).toEqual(null)

            expect(submissionInDB.grade).toBe(undefined)
        })

        test('grade submission returns unauthorized if the user is not teacher', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", false, apolloServer)

            const anotherUser = await helpers.logIn("students username", apolloServer)
            await apolloServer.executeOperation({query: addStudentToCourse, variables: {courseUniqueName: "course unique name", addStudentToCourseUsername: "students username"}})

            const points = 10
            const gradeSubmissionQuery = await apolloServer.executeOperation({query: gradeSubmission, variables: {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id, points: points}})
            expect(gradeSubmissionQuery.errors[0].message).toEqual("Unauthorized")
            console.log(gradeSubmissionQuery)
            const gradedSubmission = gradeSubmissionQuery.data.gradeSubmission
            expect(gradedSubmission).toBe(null)

            const courseInDB = await Course.findOne({uniqueName: course.uniqueName})
            const taskInDB = courseInDB.tasks[0]
            expect(taskInDB.submissions.length).toBe(1)
            
            const submissionInDB = taskInDB.submissions[0]
            expect(submissionInDB.content).toEqual("this is an answer")
            expect(submissionInDB.fromUser.toString()).toEqual(user.id)
            expect(submissionInDB.submitted).toEqual(false)
            expect(submissionInDB.submittedDate).toEqual(null)

            expect(submissionInDB.grade).toBe(undefined)
        })

    })
    describe('addInfoPageOnCourse tests', () => {
        test('createInfoPageOnCourse creates a new info page correctly', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const allowedLocationUrl = "test123-1234abc-a1b2c"
            const infoPageQuery = await apolloServer.executeOperation({query: addInfoPageOnCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: allowedLocationUrl}})
            
            expect(infoPageQuery.data.addInfoPageToCourse.locationUrl).toBeDefined()

            const coursesInDB = await Course.find()
            expect(coursesInDB.length).toBe(1)
            const courseInDB = coursesInDB[0]

            expect(courseInDB.infoPages.length).toBe(1)
            const infoPageInDB = courseInDB.infoPages[0]
          
            expect(infoPageInDB.contentBlocks).toEqual([])
            expect(infoPageInDB.locationUrl).toEqual(allowedLocationUrl)
        })
        test('createInfoPageOnCourse returns Unauthorized if the user is not a teacher', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
           
            const secondUser = await helpers.logIn("students username", apolloServer)
            const infoPageQuery = await apolloServer.executeOperation({query: addInfoPageOnCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: "test"}})
            expect(infoPageQuery.errors[0].message).toEqual("Unauthorized")
            expect(infoPageQuery.data.addInfoPageToCourse).toBe(null)

            const coursesInDB = await Course.find()
            expect(coursesInDB.length).toBe(1)
            const courseInDB = coursesInDB[0]

            expect(courseInDB.infoPages.length).toBe(0)
           
        })
        describe('createInfoPageOnCourse returns Incorrect locationUrl if the location url is incorrect', () => {
           
            test('with spaces ', async () => {
                const user = await helpers.logIn("username", apolloServer)
                const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
           
                const infoPageQuery = await apolloServer.executeOperation({query: addInfoPageOnCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: "this is incorrect url"}})
                expect(infoPageQuery.errors[0].message).toContain("Incorrect locationUrl")
                expect(infoPageQuery.data.addInfoPageToCourse).toBe(null)

                const coursesInDB = await Course.find()
                expect(coursesInDB.length).toBe(1)
                const courseInDB = coursesInDB[0]

                expect(courseInDB.infoPages.length).toBe(0)
            })
            test('with / ', async () => {
                const user = await helpers.logIn("username", apolloServer)
                const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
           
                const infoPageQuery = await apolloServer.executeOperation({query: addInfoPageOnCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: "this/is/incorrect/url"}})
                expect(infoPageQuery.errors[0].message).toContain("Incorrect locationUrl")
                expect(infoPageQuery.data.addInfoPageToCourse).toBe(null)

                const coursesInDB = await Course.find()
                expect(coursesInDB.length).toBe(1)
                const courseInDB = coursesInDB[0]

                expect(courseInDB.infoPages.length).toBe(0)
            })
            test('with % ', async () => {
                const user = await helpers.logIn("username", apolloServer)
                const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
           
                const infoPageQuery = await apolloServer.executeOperation({query: addInfoPageOnCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: "this%is%incorrect%url"}})
                expect(infoPageQuery.errors[0].message).toContain("Incorrect locationUrl")
                expect(infoPageQuery.data.addInfoPageToCourse).toBe(null)

                const coursesInDB = await Course.find()
                expect(coursesInDB.length).toBe(1)
                const courseInDB = coursesInDB[0]

                expect(courseInDB.infoPages.length).toBe(0)
            })
            test('starting with - ', async () => {
                const user = await helpers.logIn("username", apolloServer)
                const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
           
                const infoPageQuery = await apolloServer.executeOperation({query: addInfoPageOnCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: "-this-is-incorrect-url"}})
                expect(infoPageQuery.errors[0].message).toContain("Incorrect locationUrl")
                expect(infoPageQuery.data.addInfoPageToCourse).toBe(null)

                const coursesInDB = await Course.find()
                expect(coursesInDB.length).toBe(1)
                const courseInDB = coursesInDB[0]

                expect(courseInDB.infoPages.length).toBe(0)
            })
            test('ending with -', async () => {
                const user = await helpers.logIn("username", apolloServer)
                const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
           
                const infoPageQuery = await apolloServer.executeOperation({query: addInfoPageOnCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: "this-is-incorrect-url-"}})
                expect(infoPageQuery.errors[0].message).toContain("Incorrect locationUrl")
                expect(infoPageQuery.data.addInfoPageToCourse).toBe(null)

                const coursesInDB = await Course.find()
                expect(coursesInDB.length).toBe(1)
                const courseInDB = coursesInDB[0]

                expect(courseInDB.infoPages.length).toBe(0)
            })
            test('starting and ending with -', async () => {
                const user = await helpers.logIn("username", apolloServer)
                const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
           
                const infoPageQuery = await apolloServer.executeOperation({query: addInfoPageOnCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: "-this-is-incorrect-url-"}})
                expect(infoPageQuery.errors[0].message).toContain("Incorrect locationUrl")
                expect(infoPageQuery.data.addInfoPageToCourse).toBe(null)

                const coursesInDB = await Course.find()
                expect(coursesInDB.length).toBe(1)
                const courseInDB = coursesInDB[0]

                expect(courseInDB.infoPages.length).toBe(0)
            })
            test('with double -', async () => {
                const user = await helpers.logIn("username", apolloServer)
                const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
           
                const infoPageQuery = await apolloServer.executeOperation({query: addInfoPageOnCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: "this--is-incorrect-url"}})
                expect(infoPageQuery.errors[0].message).toContain("Incorrect locationUrl")
                expect(infoPageQuery.data.addInfoPageToCourse).toBe(null)

                const coursesInDB = await Course.find()
                expect(coursesInDB.length).toBe(1)
                const courseInDB = coursesInDB[0]

                expect(courseInDB.infoPages.length).toBe(0)
            })
        })
    })

    describe('addContentBlockToInfoPage query tests', () => {
        test('addContentBlockToInfoPage creates content block correctly on info page', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const allowedLocationUrl = "test123-1234abc-a1b2c"
            const infoPageQuery = await apolloServer.executeOperation({query: addInfoPageOnCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: allowedLocationUrl}})
            const infoPage = infoPageQuery.data.addInfoPageToCourse
            
            const content = "this is some info content"
            const position = 1
            
            const contentBlockQuery = await apolloServer.executeOperation({query: addContentBlockToInfoPage, variables: {
                courseUniqueName: course.uniqueName, 
                infoPageId: infoPage.id, 
                content: content,
                position: position
            }})
          
            const contentBlock = contentBlockQuery.data.addContentBlockToInfoPage
            expect(contentBlock.content).toEqual(content)
            expect(contentBlock.position).toEqual(position)


            const coursesInDB = await Course.find()
            expect(coursesInDB.length).toBe(1)
            const courseInDB = coursesInDB[0]

            expect(courseInDB.infoPages.length).toBe(1)
            const infoPageInDB = courseInDB.infoPages[0]

            expect(infoPageInDB.locationUrl).toEqual(allowedLocationUrl)
            expect(infoPageInDB.contentBlocks.length).toBe(1)
            
            const contentBlockDB = infoPageInDB.contentBlocks[0].toObject()
            delete contentBlockDB._id
            expect(contentBlockDB).toEqual({content, position})
            

        })
      
        test('addContentBlockToInfoPage returns Unauthorized if the user is not a teacher', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const allowedLocationUrl = "test123-1234abc-a1b2c"
            const infoPageQuery = await apolloServer.executeOperation({query: addInfoPageOnCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: allowedLocationUrl}})
            const infoPage = infoPageQuery.data.addInfoPageToCourse
            const otherUser = await helpers.logIn("students username", apolloServer)
            const content = "this is some info content"
            const position = 1
            
            

            const contentBlockQuery = await apolloServer.executeOperation({query: addContentBlockToInfoPage, variables: {
                courseUniqueName: course.uniqueName, 
                infoPageId: infoPage.id, 
                content: content,
                position: position
            }})
           
           expect(contentBlockQuery.errors[0].message).toEqual("Unauthorized")
           expect(contentBlockQuery.data.addContentBlockToInfoPage).toEqual(null)
            const coursesInDB = await Course.find()
            expect(coursesInDB.length).toBe(1)
            const courseInDB = coursesInDB[0]

            expect(courseInDB.infoPages.length).toBe(1)
            const infoPageInDB = courseInDB.infoPages[0]
          
            expect(infoPageInDB.contentBlocks).toEqual([])
        })

        test('addContentBlockToInfoPage returns info page not found if the info page id is incorrect', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const allowedLocationUrl = "test123-1234abc-a1b2c"
            const infoPageQuery = await apolloServer.executeOperation({query: addInfoPageOnCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: allowedLocationUrl}})
            const infoPage = infoPageQuery.data.addInfoPageToCourse
            
            const content = "this is some info content"
            const position = 1
            const contentBlockQuery = await apolloServer.executeOperation({query: addContentBlockToInfoPage, variables: {
                courseUniqueName: course.uniqueName, 
                infoPageId: "abc1234", 
                content: content,
                position: position
            }})
           
           expect(contentBlockQuery.errors[0].message).toEqual("Given info page not found")
           expect(contentBlockQuery.data.addContentBlockToInfoPage).toEqual(null)
            const coursesInDB = await Course.find()
            expect(coursesInDB.length).toBe(1)
            const courseInDB = coursesInDB[0]

            expect(courseInDB.infoPages.length).toBe(1)
            const infoPageInDB = courseInDB.infoPages[0]
          
            expect(infoPageInDB.contentBlocks).toEqual([])
        })
    })
})