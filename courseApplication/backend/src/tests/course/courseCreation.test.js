const {startServer} = require('../../server')
const request = require('supertest')
const Course = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { createCourse, addStudentToCourse, addTaskToCourse, addSubmissionToCourseTask, getAllCourses, getCourse} = require('../courseTestQueries')
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




describe('course creation tests', () => {
    test('createCourse query returns correctly with correct parameters', async () => { 
        const user = await helpers.logIn("username", "12345")
        const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "unique-name", name: "common name", teacher: "username"}})
        const correctReturnValue = {
            uniqueName: 'unique-name',
            name: 'common name',
            teacher: {
                username: 'username',
                name: 'name'
            },
            students: [],
            tasks: [],
            infoPages: []
        }
        console.log(createdCourse)
        expect(createdCourse.data.createCourse).toEqual(correctReturnValue)
    })

    test('createCourse query saves course to database correctly with correct parameters', async () => {
        const user = await helpers.logIn("username", "12345")
        const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "uniqueName", name: "common name", teacher: "username"}})
        
        const correctReturnValue = {
            uniqueName: 'uniqueName',
            name: 'common name',
            teacher: {
                username: 'username',
                name: 'name'
            },
            students: [],
            infoPages: []
        }

        //database was cleared before this test, so the database should only have 1 course created
        const savedCourses = await Course.find({}).populate('teacher')
        expect(savedCourses.length).toBe(1)
        
        const savedCourse = savedCourses[0]
        expect(savedCourse.uniqueName).toEqual(correctReturnValue.uniqueName)
        expect(savedCourse.name).toEqual(correctReturnValue.name)
        expect(savedCourse.teacher.username).toEqual(correctReturnValue.teacher.username)
        expect(savedCourse.teacher.name).toEqual(correctReturnValue.teacher.name)
        expect(savedCourse.students).toEqual(correctReturnValue.students)
        expect(savedCourse.infoPages).toEqual(correctReturnValue.infoPages)
    })
    test('createCourse query returns error if authentication is not done and doesnt save anything to database', async () => {
        const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "uniqueName", name: "common name", teacher: "does not exist"}})
        expect(createdCourse.data.createCourse).toEqual(null)
        expect(createdCourse.errors[0].message).toEqual('Unauthorized')

        const savedCourses = await Course.find({}).populate('teacher')
        expect(savedCourses.length).toBe(0)
        
    })
    describe('createCourse course unique name tests', () => {
        test('createCourse query returns error if unique name contains spaces', async () => {
            await helpers.logIn("username", "12345")
            const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "unique name", name: "common name", teacher: "does not exist"}})
            expect(createdCourse.data.createCourse).toEqual(null)
            expect(createdCourse.errors[0].message).toEqual('Incorrect unique name')
    
            const savedCourses = await Course.find({}).populate('teacher')
            expect(savedCourses.length).toBe(0)
            
        })
        test('createCourse query returns error if unique name contains /', async () => {
            await helpers.logIn("username", "12345")
            const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "unique/name", name: "common name", teacher: "does not exist"}})
            expect(createdCourse.data.createCourse).toEqual(null)
            expect(createdCourse.errors[0].message).toEqual('Incorrect unique name')
    
            const savedCourses = await Course.find({}).populate('teacher')
            expect(savedCourses.length).toBe(0)
            
        })
    })
    
})