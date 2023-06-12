const {server, apolloServer} = require('../../server')
const request = require('supertest')
const Course = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { addContentBlockToInfoPage, addInfoPageToCourse} = require('../courseTestQueries')
const { query } = require('express')
const mongoose = require('mongoose')
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




describe('addContentBlockToInfoPage query tests', () => {
    test('addContentBlockToInfoPage creates content block correctly on info page', async () => {
        const user = await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
       
        const allowedLocationUrl = "test123-1234abc-a1b2c"
        const infoPageQuery = await apolloServer.executeOperation({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: allowedLocationUrl}})
        console.log(infoPageQuery)
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
        const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
        const allowedLocationUrl = "test123-1234abc-a1b2c"
        const infoPageQuery = await apolloServer.executeOperation({query:addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: allowedLocationUrl}})
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
        const course = await helpers.createCourse("course-unique-name", "name of course", [], apolloServer)
        const allowedLocationUrl = "test123-1234abc-a1b2c"
        const infoPageQuery = await apolloServer.executeOperation({query:addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: allowedLocationUrl}})
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