const {server, apolloServer} = require('../../server')
const request = require('supertest')
const Course = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { createCourse, addTaskToCourse, removeCourse, addSubmissionToCourseTask, createChatRoom, createMessage, addUserToChatRoom} = require('../courseTestQueries')
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


describe('addUserToChatRoom tests', () => {
    test('addUserToChatRoom adds user correctly to chat room if the user is a teacher', async () => {
        const user = await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("uniqueName", "name", [], apolloServer)
        const chatRoom = await helpers.createChatRoom(course, "room name", apolloServer)
        const addUserToChatRoomQuery = await apolloServer.executeOperation({query: addUserToChatRoom, 
            variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id, username: "students username"}})
        expect(addUserToChatRoomQuery.data.addUserToChatRoom?.username).toEqual("students username")
    })
})