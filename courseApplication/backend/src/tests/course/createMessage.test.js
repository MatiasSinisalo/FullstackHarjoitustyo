const {server, apolloServer} = require('../../server')
const request = require('supertest')
const Course = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { createCourse, addTaskToCourse, removeCourse, addSubmissionToCourseTask, createChatRoom, createMessage} = require('../courseTestQueries')
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

describe('createMessage tests', () => {
    test('createMessage creates message correctly', async () => {
        const user = await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("uniqueName", "name", [], apolloServer)
        const chatRoom = await helpers.createChatRoom(course, "room name", apolloServer)
        const expectedMessage = {
            fromUser: {
                username: user.username,
                name: user.name,
                id: user.id
            },
            sendDate: new Date(Date.now()),
            content: "hello there",
        }
        const createMessageQuery = await apolloServer.executeOperation({query: createMessage, 
            variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id, content: expectedMessage.content}})
        expect(createMessageQuery.data.createMessage).toEqual(expectedMessage)
    })
})