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
    await mongoose.connect(config.MONGODB_URI)
    await Course.deleteMany({})
    await User.deleteMany({})
    await request(url).post("/").send({query: userCreateQuery, variables: {}})
    await request(url).post("/").send({query: createSpesificUserQuery, variables:{username: "students username", name: "students name", password: "12345"}})
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

const checkContentBlockContent = async (content) => {
    const coursesInDB = await Course.find({})
    expect(coursesInDB.length).toBe(1)

    const courseInDB = coursesInDB[0]
    expect(courseInDB.infoPages.length).toBe(1)

    const infoPageInDB = courseInDB.infoPages[0]
    expect(infoPageInDB.contentBlocks.length).toBe(1)
    
    const contentBlockInDB = infoPageInDB.contentBlocks[0]
    expect(contentBlockInDB.content).toEqual(content)
}

describe('modifyContentBlock tests', () => {
    test('modifyContentBlock modifies content block content correctly', async () => {
        await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("unique-name", "name", [], apolloServer)
        const infopage = await helpers.createInfoPage(course, "page-url", apolloServer)
        const contentBlock = await helpers.createContentBlock(course, infopage, "this is some text", 0, apolloServer)
        
        const newContent = "this is modified content"
        const contentBlockEditQuery = await apolloServer.executeOperation({query: modifyContentBlock, 
            variables: {courseUniqueName: course.uniqueName, infoPageId: infopage.id, contentBlockId: contentBlock.id, content: newContent}})
        expect(contentBlockEditQuery.data.modifyContentBlock.content).toEqual(newContent)

        await checkContentBlockContent(newContent)
    })

    test('modifyContentBlock modifies returns Unauthorized if user is not teacher', async () => {
        await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("unique-name", "name", [], apolloServer)
        const infopage = await helpers.createInfoPage(course, "page-url", apolloServer)
        const contentBlock = await helpers.createContentBlock(course, infopage, "this is some text", 0, apolloServer)
        
        const newContent = "this is modified content"
        await helpers.logIn("students username", apolloServer)
        const contentBlockEditQuery = await apolloServer.executeOperation({query: modifyContentBlock, 
            variables: {courseUniqueName: course.uniqueName, infoPageId: infopage.id, contentBlockId: contentBlock.id, content: newContent}})
        expect(contentBlockEditQuery.data.modifyContentBlock).toEqual(null)
        expect(contentBlockEditQuery.errors[0].message).toEqual("Unauthorized")

        await checkContentBlockContent(contentBlock.content)
    })

    test('modifyContentBlock modifies returns Given course not found if course is not found', async () => {
        await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("unique-name", "name", [], apolloServer)
        const infopage = await helpers.createInfoPage(course, "page-url", apolloServer)
        const contentBlock = await helpers.createContentBlock(course, infopage, "this is some text", 0, apolloServer)
        
        const newContent = "this is modified content"
        const contentBlockEditQuery = await apolloServer.executeOperation({query: modifyContentBlock, 
            variables: {courseUniqueName: "does not exist", infoPageId: infopage.id, contentBlockId: contentBlock.id, content: newContent}})
        expect(contentBlockEditQuery.data.modifyContentBlock).toEqual(null)
        expect(contentBlockEditQuery.errors[0].message).toEqual("Given course not found")
        
        await checkContentBlockContent(contentBlock.content)
    })

    test('modifyContentBlock modifies returns Given info page not found if page is not found', async () => {
        await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("unique-name", "name", [], apolloServer)
        const infopage = await helpers.createInfoPage(course, "page-url", apolloServer)
        const contentBlock = await helpers.createContentBlock(course, infopage, "this is some text", 0, apolloServer)
        
        const newContent = "this is modified content"
        const contentBlockEditQuery = await apolloServer.executeOperation({query: modifyContentBlock, 
            variables: {courseUniqueName: course.uniqueName, infoPageId:"abc1234", contentBlockId: contentBlock.id, content: newContent}})
        expect(contentBlockEditQuery.data.modifyContentBlock).toEqual(null)
        expect(contentBlockEditQuery.errors[0].message).toEqual("Given info page not found")
        
        await checkContentBlockContent(contentBlock.content)
    })

    test('modifyContentBlock modifies returns Given content block not found if content block is not found', async () => {
        await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("unique-name", "name", [], apolloServer)
        const infopage = await helpers.createInfoPage(course, "page-url", apolloServer)
        const contentBlock = await helpers.createContentBlock(course, infopage, "this is some text", 0, apolloServer)
        
        const newContent = "this is modified content"
        const contentBlockEditQuery = await apolloServer.executeOperation({query: modifyContentBlock, 
            variables: {courseUniqueName: course.uniqueName, infoPageId:infopage.id, contentBlockId: "abc1234", content: newContent}})
        expect(contentBlockEditQuery.data.modifyContentBlock).toEqual(null)
        expect(contentBlockEditQuery.errors[0].message).toEqual("Given content block not found")
        
        await checkContentBlockContent(contentBlock.content)
    })

})