const {server, apolloServer} = require('../server')
const request = require('supertest')
const Course = require('../models/course')
const User = require('../models/user')
const { userCreateQuery, userLogInQuery } = require('./userTestQueries')
const { createCourse } = require('./courseTestQueries')
const { query } = require('express')

beforeAll(async () => {
    await server.start("test server ready")
    await Course.deleteMany({})
    await User.deleteMany({})
    await apolloServer.executeOperation({query: userCreateQuery, variables:{}})
})

afterAll(async () => {
    await Course.deleteMany({})
    await User.deleteMany({})
    await server.stop()
})

beforeEach(async () => {
    apolloServer.context = {}
    await Course.deleteMany({})
})

describe('course tests', () => {
    describe('course creation tests', () => {
        test('createCourse query returns correctly with correct parameters', async () => {
            apolloServer.context = {userForToken: {username: "username", name: "name"}}

            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "uniqueName", name: "common name", teacher: "username"}})
            
            const correctReturnValue = {
                uniqueName: 'uniqueName',
                name: 'common name',
                teacher: {
                    username: 'username',
                    name: 'name'
                },
                students: []
            }
            expect(createdCourse.data.createCourse).toEqual(correctReturnValue)
        })

        test('createCourse query saves course to database correctly with correct parameters', async () => {
            apolloServer.context = {userForToken: {username: "username", name: "name"}}
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "uniqueName", name: "common name", teacher: "username"}})
            
            const correctReturnValue = {
                uniqueName: 'uniqueName',
                name: 'common name',
                teacher: {
                    username: 'username',
                    name: 'name'
                },
                students: []
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

        })

        test('createCourse query returns error if teacher user does not exist', async () => {
            apolloServer.context = {userForToken: {username: "does not exist", name: "name"}}
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "uniqueName", name: "common name", teacher: "does not exist"}})
            expect(createdCourse.data.createCourse).toEqual(null)
            expect(createdCourse.errors[0].message).toEqual('no user with given username found!')
            
        })

        test('createCourse query returns error if authentication is not done and doesnt save anything to database', async () => {
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "uniqueName", name: "common name", teacher: "does not exist"}})
            expect(createdCourse.data.createCourse).toEqual(null)
            expect(createdCourse.errors[0].message).toEqual('Unauthorized')

            const savedCourses = await Course.find({}).populate('teacher')
            expect(savedCourses.length).toBe(0)
            
        })
    })
})