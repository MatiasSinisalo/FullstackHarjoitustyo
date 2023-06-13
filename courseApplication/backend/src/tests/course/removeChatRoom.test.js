const {server, apolloServer} = require('../../server')
const request = require('supertest')
const Course = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { addContentBlockToInfoPage, addInfoPageToCourse, removeContentBlockFromInfoPage, createChatRoom, removeChatRoom} = require('../courseTestQueries')
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


describe('removeChatRoom tests', () => {
    test('removeChatRoom removes chat room correctly', async () => {
        await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("courseUniqueName", "name", [], apolloServer)
        const chatRoom = await helpers.createChatRoom(course, "room", apolloServer)

        const removeChatRoomQuery = await apolloServer.executeOperation({query: removeChatRoom, 
            variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id}})
        expect(removeChatRoomQuery.data.removeChatRoom).toBe(true)
    })
})