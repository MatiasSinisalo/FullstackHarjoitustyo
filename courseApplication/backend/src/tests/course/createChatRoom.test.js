const {server, apolloServer} = require('../../server')
const request = require('supertest')
const Course = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { createCourse, addTaskToCourse, removeCourse, addSubmissionToCourseTask, createChatRoom} = require('../courseTestQueries')
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


describe("createChatRoom tests", () => {
    test('createChatRoom creates chatRoom correctly', async () => {
        await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("courseUniqueName", "name", [], apolloServer)
        const createChatRoomQuery = await apolloServer.executeOperation({query: createChatRoom, variables: {courseUnqueName: course.uniqueName, name: "name of chat room"}})
        expect(createChatRoomQuery.data.createChatRoom.name).toEqual("name of chat room")
    })
})