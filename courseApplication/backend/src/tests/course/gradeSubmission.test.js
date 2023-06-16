const {server, apolloServer} = require('../../server')
const request = require('supertest')
const Course = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { createCourse, addTaskToCourse, addStudentToCourse, gradeSubmission} = require('../courseTestQueries')
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




describe('grade submission tests', () => {
    test('teacher can give a grade', async () => {
        const user = await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
        const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
        const submission = await helpers.createSubmission(course, task.id, "this is an answer", false, apolloServer)

        const points = 10
        const gradeSubmissionQuery = await helpers.makeQuery({query: gradeSubmission, variables: {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id, points: points}})
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
        const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
        const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
        const submission = await helpers.createSubmission(course, task.id, "this is an answer", false, apolloServer)

        const points = 10
        const gradeSubmissionQuery = await helpers.makeQuery({query: gradeSubmission, variables: {courseUniqueName:"this course wont exist", taskId: task.id, submissionId: submission.id, points: points}})
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
        const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
        const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
        const submission = await helpers.createSubmission(course, task.id, "this is an answer", false, apolloServer)

        const points = 10
        const gradeSubmissionQuery = await helpers.makeQuery({query: gradeSubmission, variables: {courseUniqueName: course.uniqueName, taskId: "incorrectTaskId", submissionId: submission.id, points: points}})
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
        const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
        const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
        const submission = await helpers.createSubmission(course, task.id, "this is an answer", false, apolloServer)

        const points = 10
        const gradeSubmissionQuery = await helpers.makeQuery({query: gradeSubmission, variables: {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: "incorrectSubmissionId", points: points}})
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
        const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
        const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
        const submission = await helpers.createSubmission(course, task.id, "this is an answer", false, apolloServer)

        const anotherUser = await helpers.logIn("students username", apolloServer)
        await helpers.makeQuery({query: addStudentToCourse, variables: {courseUniqueName: "course-unique-name", addStudentToCourseUsername: "students username"}})

        const points = 10
        const gradeSubmissionQuery = await helpers.makeQuery({query: gradeSubmission, variables: {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id, points: points}})
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