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