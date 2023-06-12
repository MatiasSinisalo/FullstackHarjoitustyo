const {server, apolloServer} = require('../../server')
const request = require('supertest')
const Course = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { createCourse, addStudentToCourse, removeStudentFromCourse, addTaskToCourse, addSubmissionToCourseTask, getAllCourses, getCourse, addInfoPageToCourse, removeInfoPageFromCourse} = require('../courseTestQueries')
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

const checkInfoPageStillExists = async (infoPage) => {
    const coursesInDB = await Course.find({})
    expect(coursesInDB.length).toBe(1)
    const courseInDB = coursesInDB[0]
    expect(courseInDB.infoPages.length).toBe(1)
    expect(courseInDB.infoPages[0].id).toEqual(infoPage.id)
}

describe('removeInfoPageFromCourse tests', () => {
    test('remove info page removes info page correctly', async () => {
        await helpers.logIn("username", apolloServer)


        const course = await helpers.createCourse("courses-unique-name", "name", [], apolloServer)
        const infoPageThatShouldNotBeRemoved = await apolloServer.executeOperation({
            query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: "this-is-not-to-be-removed"}})

        const infoPageQuery = await apolloServer.executeOperation({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: "this-is-url"}})
        const infoPage = infoPageQuery.data.addInfoPageToCourse
        const infoPageRemoveQuery = await apolloServer.executeOperation({query: removeInfoPageFromCourse, variables: {courseUniqueName: course.uniqueName, infoPageId: infoPage.id}})
        
        expect(infoPageRemoveQuery.data.removeInfoPageFromCourse).toBe(true)

        await checkInfoPageStillExists(infoPageThatShouldNotBeRemoved.data.addInfoPageToCourse)
    })

    test('remove info page returns Unauthorized if the user is not a teacher', async () => {
        await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("courses-unique-name", "name", [], apolloServer)
        const infoPageQuery = await apolloServer.executeOperation({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: "this-is-url"}})
        const infoPage = infoPageQuery.data.addInfoPageToCourse
        await helpers.logIn("students username", apolloServer)
        const infoPageRemoveQuery = await apolloServer.executeOperation({query: removeInfoPageFromCourse, variables: {courseUniqueName: course.uniqueName, infoPageId: infoPage.id}})
        
        expect(infoPageRemoveQuery.errors[0].message).toBe("Unauthorized")
        expect(infoPageRemoveQuery.data.removeInfoPageFromCourse).toBe(null)

        await checkInfoPageStillExists(infoPage)
    })

    test('removeInfoPageFromCourse returns given course not found if the course is not found', async () => {
        await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("courses-unique-name", "name", [], apolloServer)
        const infoPageQuery = await apolloServer.executeOperation({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: "this-is-url"}})
        const infoPage = infoPageQuery.data.addInfoPageToCourse
        const infoPageRemoveQuery = await apolloServer.executeOperation({query: removeInfoPageFromCourse, variables: {courseUniqueName: "course does not exist", infoPageId: infoPage.id}})
        
        expect(infoPageRemoveQuery.errors[0].message).toBe("Given course not found")
        expect(infoPageRemoveQuery.data.removeInfoPageFromCourse).toBe(null)

        await checkInfoPageStillExists(infoPage)
    })

    test('removeInfoPageFromCourse returns given page not found if the page is not found', async () => {
        await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("courses-unique-name", "name", [], apolloServer)
        const infoPageQuery = await apolloServer.executeOperation({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: "this-is-url"}})
        const infoPage = infoPageQuery.data.addInfoPageToCourse
        const infoPageRemoveQuery = await apolloServer.executeOperation({query: removeInfoPageFromCourse, variables: {courseUniqueName: course.uniqueName, infoPageId: "abc1234"}})
        
        expect(infoPageRemoveQuery.errors[0].message).toBe("Given info page not found")
        expect(infoPageRemoveQuery.data.removeInfoPageFromCourse).toBe(null)

        await checkInfoPageStillExists(infoPage)
    })


})

