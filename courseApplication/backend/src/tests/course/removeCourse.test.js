
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





describe('removeCourse tests', () => {
    test('removeCourse removes course and its child objects from database', async ()=>{
        await helpers.logIn("username", apolloServer)

        const courseToBeRemoved = {
            uniqueName:  "course-to-be-removed",
            name: "common name"
        }

        const courseThatShouldNotBeRemoved = {
            uniqueName:  "course-that-should-not-be-removed",
            name: "common name"
        }
        const courseToRemove = await helpers.makeQuery({query: createCourse, variables: {uniqueName: courseToBeRemoved.uniqueName, name: courseToBeRemoved.name, teacher: ""}})
        const courseToStay = await helpers.makeQuery({query: createCourse, variables: {uniqueName: courseThatShouldNotBeRemoved.uniqueName, name: courseThatShouldNotBeRemoved.name, teacher: ""}})

        const task = {
            description:  "this is the description of the course that is about testing",
            deadline: new Date("2030-06-25"),
            submissions: []
        }
        const taskCreateQuery = await helpers.makeQuery({query: addTaskToCourse, variables: {
            courseUniqueName: courseToBeRemoved.uniqueName, 
            description: task.description, 
            deadline: task.deadline.toString()
        }});
      
        const submission = {
            content : "this is the answer to a task",
            submitted: true,
            taskId: taskCreateQuery.data.addTaskToCourse.id
        }
        await helpers.makeQuery({query: addSubmissionToCourseTask,variables: {
            courseUniqueName: courseToBeRemoved.uniqueName, 
            taskId: submission.taskId,
            content: submission.content, 
            submitted: submission.submitted,
        }});
        
        const courseRemoveQuery = await helpers.makeQuery({query: removeCourse, variables: {uniqueName: courseToBeRemoved.uniqueName}})
        expect(courseRemoveQuery.data.removeCourse).toBe(true)

        const coursesInDB = await Course.find({})
        expect(coursesInDB.length).toBe(1)
        expect(coursesInDB[0].uniqueName).toEqual(courseThatShouldNotBeRemoved.uniqueName)
        expect(coursesInDB[0].name).toEqual(courseThatShouldNotBeRemoved.name)
        expect(coursesInDB[0].teacher).toBeDefined() 

        const tasksInDB = await Task.find({})
        expect(tasksInDB.length).toBe(0)
    })

    test('removeCourse query returns Unauthorized if user that is not a teacher tries to remove the course', async () => {
        await helpers.logIn("username", apolloServer)

        const courseToNotBeRemoved = {
            uniqueName:  "course-to-be-removed",
            name: "common name"
        }
        await helpers.makeQuery({query: createCourse, variables: {uniqueName: courseToNotBeRemoved.uniqueName, name: courseToNotBeRemoved.name, teacher: ""}})
        
        await helpers.logIn("students username", apolloServer)
        
        const courseRemoveQuery = await helpers.makeQuery({query: removeCourse, variables: {uniqueName: courseToNotBeRemoved.uniqueName}})
        expect(courseRemoveQuery.data.removeCourse).toBe(null)
        expect(courseRemoveQuery.errors[0].message).toBe("Unauthorized")


        const coursesInDB = await Course.find({})
        expect(coursesInDB.length).toBe(1)
        expect(coursesInDB[0].uniqueName).toEqual(courseToNotBeRemoved.uniqueName)
        expect(coursesInDB[0].name).toEqual(courseToNotBeRemoved.name)
        expect(coursesInDB[0].teacher).toBeDefined() 
    })

    test('removeCourse query returns No given course found! if trying to remove a course that does not exist', async () => {
        await helpers.logIn("username", apolloServer)

        const courseToNotBeRemoved = {
            uniqueName:  "course-to-be-removed",
            name: "common name"
        }
        await helpers.makeQuery({query: createCourse, variables: {uniqueName: courseToNotBeRemoved.uniqueName, name: courseToNotBeRemoved.name, teacher: ""}})
        
        const courseRemoveQuery = await helpers.makeQuery({query: removeCourse, variables: {uniqueName: "this course does not exist"}})
        expect(courseRemoveQuery.data.removeCourse).toBe(null)
        expect(courseRemoveQuery.errors[0].message).toBe("Given course not found")


        const coursesInDB = await Course.find({})
        expect(coursesInDB.length).toBe(1)
        expect(coursesInDB[0].uniqueName).toEqual(courseToNotBeRemoved.uniqueName)
        expect(coursesInDB[0].name).toEqual(courseToNotBeRemoved.name)
        expect(coursesInDB[0].teacher).toBeDefined() 
    })
})
