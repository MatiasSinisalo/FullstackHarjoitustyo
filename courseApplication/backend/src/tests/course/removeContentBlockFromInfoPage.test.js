const {server, apolloServer} = require('../../server')
const request = require('supertest')
const Course = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { addContentBlockToInfoPage, addInfoPageToCourse, removeContentBlockFromInfoPage} = require('../courseTestQueries')
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


describe('removeContentBlockFromInfoPage tests', () => {
    test('removeContentBlockFromInfoPage removes contentBlock correctly', async () => {
        await helpers.logIn("username", apolloServer)
        const coursename = "courses unique name"
        const course = await helpers.createCourse(coursename, "name", [], apolloServer)
        
        const allowedLocationUrl = "test123-1234abc-a1b2c"
        const infoPageQuery = await apolloServer.executeOperation({query: addInfoPageToCourse, 
            variables: {courseUniqueName: course.uniqueName, locationUrl: allowedLocationUrl}})
        const infoPage = infoPageQuery.data.addInfoPageToCourse
        
      
        
        const contentBlockThatShouldNotBeRemoved = await apolloServer.executeOperation({query: addContentBlockToInfoPage, variables: {
            courseUniqueName: course.uniqueName, 
            infoPageId: infoPage.id, 
            content: "should not be removed",
            position: 1
        }})

        const content = "this is some info content"
        const position = 2
        const contentBlockQuery = await apolloServer.executeOperation({query: addContentBlockToInfoPage, variables: {
            courseUniqueName: course.uniqueName, 
            infoPageId: infoPage.id, 
            content: content,
            position: position
        }})
        const contentBlock = contentBlockQuery.data.addContentBlockToInfoPage
        
        const removed = await apolloServer.executeOperation({query: removeContentBlockFromInfoPage, 
            variables: {courseUniqueName: course.uniqueName, infoPageId: infoPage.id, contentBlockId: contentBlock.id}})

        expect(removed.data.removeContentBlockFromInfoPage).toBe(true)

        const coursesInDB = await Course.find({})
        expect(coursesInDB.length).toBe(1)

        const courseInDB = coursesInDB[0]
        expect(courseInDB.infoPages.length).toBe(1)

        const infoPageInDB = courseInDB.infoPages[0]
        expect(infoPageInDB.contentBlocks.length).toBe(1)

        const contentBlockInDB = infoPageInDB.contentBlocks[0]
        expect(contentBlockInDB.content).toEqual("should not be removed")
    })
})