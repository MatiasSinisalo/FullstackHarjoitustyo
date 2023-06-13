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

const checkCourseNotChanged = async () => {
    const coursesInDB =  await Course.find({})
    expect(coursesInDB.length).toBe(1)
    const courseInDB = coursesInDB[0]
    expect(courseInDB.chatRooms.length).toBe(1)
    expect(courseInDB.chatRooms[0].messages.length).toBe(0)
}

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
        console.log(createMessageQuery)
        const message = createMessageQuery.data.createMessage
        expect(message.fromUser).toEqual(expectedMessage.fromUser)
        expect(message.content).toEqual(expectedMessage.content)
        
        expect(new Date(Number(message.sendDate)).getFullYear()).toEqual(expectedMessage.sendDate.getFullYear())
        expect(new Date(Number(message.sendDate)).getMonth()).toEqual(expectedMessage.sendDate.getMonth())
        expect(new Date(Number(message.sendDate)).getDate()).toEqual(expectedMessage.sendDate.getDate())
        expect(new Date(Number(message.sendDate)).getMinutes()).toEqual(expectedMessage.sendDate.getMinutes())

        const coursesInDB = await Course.find({})
        expect(coursesInDB.length).toBe(1)

        const courseInDB = coursesInDB[0]
        expect(courseInDB.chatRooms.length).toBe(1)
        
        const chatRoomInDB = courseInDB.chatRooms[0]
        expect(chatRoomInDB.messages.length).toBe(1)

        const messageInDB = chatRoomInDB.messages[0]
        const messageObj = messageInDB.toObject()

        const dateInDB = messageObj.sendDate
        
        expect(new Date(dateInDB).getFullYear()).toEqual(expectedMessage.sendDate.getFullYear())
        expect(new Date(dateInDB).getMonth()).toEqual(expectedMessage.sendDate.getMonth())
        expect(new Date(dateInDB).getDate()).toEqual(expectedMessage.sendDate.getDate())
        expect(new Date(dateInDB).getMinutes()).toEqual(expectedMessage.sendDate.getMinutes())

        delete messageObj._id
        delete messageObj.sendDate
        expect(messageObj).toEqual({...expectedMessage, fromUser: user._id, sendDate: undefined})
    })

    test('createMessage returns Unauthorized if the user is not admin and not participating in chatRoom', async () => {
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
       await helpers.logIn("students username", apolloServer)
        const createMessageQuery = await apolloServer.executeOperation({query: createMessage, 
            variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id, content: expectedMessage.content}})
        console.log(createMessageQuery)
        const message = createMessageQuery.data.createMessage
        expect(createMessageQuery.data.createMessage).toEqual(null)
        expect(createMessageQuery.errors[0].message).toEqual("Unauthorized")

        await checkCourseNotChanged()
    })

    test('createMessage returns Course not found if course is not found', async () => {
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
            variables: {courseUniqueName: "course-not-found", chatRoomId: chatRoom.id, content: expectedMessage.content}})
        console.log(createMessageQuery)
        const message = createMessageQuery.data.createMessage
        expect(createMessageQuery.data.createMessage).toEqual(null)
        expect(createMessageQuery.errors[0].message).toEqual("Given course not found")
        await checkCourseNotChanged()
    })

    test('createMessage returns Given chatroom not found if message chat is not found', async () => {
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
            variables: {courseUniqueName: course.uniqueName, chatRoomId: "abc1234", content: expectedMessage.content}})
        console.log(createMessageQuery)
        const message = createMessageQuery.data.createMessage
        expect(createMessageQuery.data.createMessage).toEqual(null)
        expect(createMessageQuery.errors[0].message).toEqual("Given chatroom not found")
        await checkCourseNotChanged()
    })
})