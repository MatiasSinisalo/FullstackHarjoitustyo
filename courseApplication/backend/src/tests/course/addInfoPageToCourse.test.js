const {server, apolloServer} = require('../../server')
const request = require('supertest')
const Course = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { addInfoPageToCourse} = require('../courseTestQueries')
const { query } = require('express')
const mongoose = require('mongoose')
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





describe('addInfoPageToCourse tests', () => {
    test('createInfoPageToCourse creates a new info page correctly', async () => {
        const user = await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
        const allowedLocationUrl = "test123-1234abc-a1b2c"
        const infoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: allowedLocationUrl}})
        
        expect(infoPageQuery.data.addInfoPageToCourse.locationUrl).toBeDefined()

        const coursesInDB = await Course.find()
        expect(coursesInDB.length).toBe(1)
        const courseInDB = coursesInDB[0]

        expect(courseInDB.infoPages.length).toBe(1)
        const infoPageInDB = courseInDB.infoPages[0]
      
        expect(infoPageInDB.contentBlocks).toEqual([])
        expect(infoPageInDB.locationUrl).toEqual(allowedLocationUrl)
    })
    test('createInfoPageToCourse returns Unauthorized if the user is not a teacher', async () => {
        const user = await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
       
        const secondUser = await helpers.logIn("students username", apolloServer)
        const infoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: "test"}})
        expect(infoPageQuery.errors[0].message).toEqual("Unauthorized")
        expect(infoPageQuery.data.addInfoPageToCourse).toBe(null)

        const coursesInDB = await Course.find()
        expect(coursesInDB.length).toBe(1)
        const courseInDB = coursesInDB[0]
        expect(courseInDB.infoPages.length).toBe(0)
       
    })
    test('createInfoPageToCourse does not allow multiple pages with the same url', async () => {
        const user = await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
        const allowedLocationUrl = "test123-1234abc-a1b2c"
        const firstInfoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: allowedLocationUrl}})
        const secondInfoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: allowedLocationUrl}})

        expect(secondInfoPageQuery.data.addInfoPageToCourse).toBe(null)
        expect(secondInfoPageQuery.errors[0].message).toEqual("Given page already exists")
        
        const coursesInDB = await Course.find()
        expect(coursesInDB.length).toBe(1)
        const courseInDB = coursesInDB[0]
        expect(courseInDB.infoPages.length).toBe(1)

        
    })
    describe('createInfoPageToCourse returns Incorrect locationUrl if the location url is incorrect', () => {
       
        test('with spaces ', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
       
            const infoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: "this is incorrect url"}})
            expect(infoPageQuery.errors[0].message).toContain("Incorrect locationUrl")
            expect(infoPageQuery.data.addInfoPageToCourse).toBe(null)

            const coursesInDB = await Course.find()
            expect(coursesInDB.length).toBe(1)
            const courseInDB = coursesInDB[0]

            expect(courseInDB.infoPages.length).toBe(0)
        })
        test('with / ', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
       
            const infoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: "this/is/incorrect/url"}})
            expect(infoPageQuery.errors[0].message).toContain("Incorrect locationUrl")
            expect(infoPageQuery.data.addInfoPageToCourse).toBe(null)

            const coursesInDB = await Course.find()
            expect(coursesInDB.length).toBe(1)
            const courseInDB = coursesInDB[0]

            expect(courseInDB.infoPages.length).toBe(0)
        })
        test('with % ', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
       
            const infoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: "this%is%incorrect%url"}})
            expect(infoPageQuery.errors[0].message).toContain("Incorrect locationUrl")
            expect(infoPageQuery.data.addInfoPageToCourse).toBe(null)

            const coursesInDB = await Course.find()
            expect(coursesInDB.length).toBe(1)
            const courseInDB = coursesInDB[0]

            expect(courseInDB.infoPages.length).toBe(0)
        })
        test('starting with - ', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
       
            const infoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: "-this-is-incorrect-url"}})
            expect(infoPageQuery.errors[0].message).toContain("Incorrect locationUrl")
            expect(infoPageQuery.data.addInfoPageToCourse).toBe(null)

            const coursesInDB = await Course.find()
            expect(coursesInDB.length).toBe(1)
            const courseInDB = coursesInDB[0]

            expect(courseInDB.infoPages.length).toBe(0)
        })
        test('ending with -', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
       
            const infoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: "this-is-incorrect-url-"}})
            expect(infoPageQuery.errors[0].message).toContain("Incorrect locationUrl")
            expect(infoPageQuery.data.addInfoPageToCourse).toBe(null)

            const coursesInDB = await Course.find()
            expect(coursesInDB.length).toBe(1)
            const courseInDB = coursesInDB[0]

            expect(courseInDB.infoPages.length).toBe(0)
        })
        test('starting and ending with -', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
       
            const infoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: "-this-is-incorrect-url-"}})
            expect(infoPageQuery.errors[0].message).toContain("Incorrect locationUrl")
            expect(infoPageQuery.data.addInfoPageToCourse).toBe(null)

            const coursesInDB = await Course.find()
            expect(coursesInDB.length).toBe(1)
            const courseInDB = coursesInDB[0]

            expect(courseInDB.infoPages.length).toBe(0)
        })
        test('with double -', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
       
            const infoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: "this--is-incorrect-url"}})
            expect(infoPageQuery.errors[0].message).toContain("Incorrect locationUrl")
            expect(infoPageQuery.data.addInfoPageToCourse).toBe(null)

            const coursesInDB = await Course.find()
            expect(coursesInDB.length).toBe(1)
            const courseInDB = coursesInDB[0]

            expect(courseInDB.infoPages.length).toBe(0)
        })
    })
})