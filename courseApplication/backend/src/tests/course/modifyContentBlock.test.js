const {server, apolloServer} = require('../../server')
const request = require('supertest')
const Course = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { createCourse, addTaskToCourse, addStudentToCourse, gradeSubmission, modifyContentBlock} = require('../courseTestQueries')
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


describe('modifyContentBlock tests', () => {
    test('modifyContentBlock modifies content block content correctly', async () => {
        await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("unique name", "name", [], apolloServer)
        const infopage = await helpers.createInfoPage(course, "page-url", apolloServer)
        const contentBlock = await helpers.createContentBlock(course, infopage, "this is some text", 0, apolloServer)
        
        const newContent = "this is modified content"
        const contentBlockEditQuery = await apolloServer.executeOperation({query: modifyContentBlock, 
            variables: {courseUniqueName: course.uniqueName, infoPageId: infopage.id, contentBlockId: contentBlock.id, content: newContent}})
        expect(contentBlockEditQuery.data.modifyContentBlock.content).toEqual(newContent)

        const coursesInDB = await Course.find({})
        expect(coursesInDB.length).toBe(1)

        const courseInDB = coursesInDB[0]
        expect(courseInDB.infoPages.length).toBe(1)

        const infoPageInDB = courseInDB.infoPages[0]
        expect(infoPageInDB.contentBlocks.length).toBe(1)
        
        const contentBlockInDB = infoPageInDB.contentBlocks[0]
        expect(contentBlockInDB.content).toEqual(newContent)
    })

})