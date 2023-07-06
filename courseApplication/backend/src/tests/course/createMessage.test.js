
const request = require('supertest')
const {Course} = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { createCourse, addTaskToCourse, removeCourse, addSubmissionToCourseTask, createChatRoom, createMessage, addStudentToCourse, addUserToChatRoom} = require('../courseTestQueries')
const { query } = require('express')
const mongoose = require('mongoose')
const helpers = require('../testHelpers')
const config = require('../../config')


const checkCourseNotChanged = async () => {
    const coursesInDB =  await Course.find({})
    expect(coursesInDB.length).toBe(1)
    const courseInDB = coursesInDB[0]
    expect(courseInDB.chatRooms.length).toBe(1)
    expect(courseInDB.chatRooms[0].messages.length).toBe(0)
}

describe('createMessage tests', () => {
    test('createMessage creates message correctly if user is admin', async () => {
        const user = await helpers.logIn("username")
        const course = await helpers.createCourse("uniqueName", "name", [])
        const chatRoom = await helpers.createChatRoom(course, "room name")
        const expectedMessage = {
            fromUser: {
                username: user.username,
                name: user.name,
                id: user.id
            },
            sendDate: new Date(Date.now()),
            content: "hello there",
        }
        const createMessageQuery = await helpers.makeQuery({query: createMessage, 
            variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id, content: expectedMessage.content}})
        console.log(createMessageQuery)
        const message = createMessageQuery.data.createMessage
        expect(message.fromUser).toEqual(expectedMessage.fromUser)
        expect(message.content).toEqual(expectedMessage.content)
        checkDateCorrect(Number(message.sendDate), expectedMessage)

        await checkDataBaseInCorrectState(expectedMessage, user)
    })

    test('createMessage creates message correctly if user is pariticipating in the chat room', async () => {
        const adminUser = await helpers.logIn("username")
        const course = await helpers.createCourse("uniqueName", "name", [])
        const chatRoom = await helpers.createChatRoom(course, "room name")
        await helpers.makeQuery({query: addStudentToCourse, variables: {courseUniqueName: course.uniqueName, addStudentToCourseUsername: "students username"}})
        await helpers.makeQuery({query: addUserToChatRoom, variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id, username: "students username"}})
       
        const user =  await helpers.logIn("students username")
       
        const expectedMessage = {
            fromUser: {
                username: user.username,
                name: user.name,
                id: user.id
            },
            sendDate: new Date(Date.now()),
            content: "hello there",
        }
        const createMessageQuery = await helpers.makeQuery({query: createMessage, 
            variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id, content: expectedMessage.content}})
        console.log(createMessageQuery)
        const message = createMessageQuery.data.createMessage
        expect(message.fromUser).toEqual(expectedMessage.fromUser)
        expect(message.content).toEqual(expectedMessage.content)
        checkDateCorrect(Number(message.sendDate), expectedMessage)

        await checkDataBaseInCorrectState(expectedMessage, user)
    })

    test('createMessage returns Unauthorized if the user is not admin and not participating in chatRoom', async () => {
        const user = await helpers.logIn("username")
        const course = await helpers.createCourse("uniqueName", "name", [])
        const chatRoom = await helpers.createChatRoom(course, "room name")
        const expectedMessage = {
            fromUser: {
                username: user.username,
                name: user.name,
                id: user.id
            },
            sendDate: new Date(Date.now()),
            content: "hello there",
        }
       await helpers.logIn("students username")
        const createMessageQuery = await helpers.makeQuery({query: createMessage, 
            variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id, content: expectedMessage.content}})
        console.log(createMessageQuery)
        const message = createMessageQuery.data.createMessage
        expect(createMessageQuery.data.createMessage).toEqual(null)
        expect(createMessageQuery.errors[0].message).toEqual("Unauthorized")

        await checkCourseNotChanged()
    })

    test('createMessage returns Course not found if course is not found', async () => {
        const user = await helpers.logIn("username")
        const course = await helpers.createCourse("uniqueName", "name", [])
        const chatRoom = await helpers.createChatRoom(course, "room name")
        const expectedMessage = {
            fromUser: {
                username: user.username,
                name: user.name,
                id: user.id
            },
            sendDate: new Date(Date.now()),
            content: "hello there",
        }
        const createMessageQuery = await helpers.makeQuery({query: createMessage, 
            variables: {courseUniqueName: "course-not-found", chatRoomId: chatRoom.id, content: expectedMessage.content}})
        console.log(createMessageQuery)
        const message = createMessageQuery.data.createMessage
        expect(createMessageQuery.data.createMessage).toEqual(null)
        expect(createMessageQuery.errors[0].message).toEqual("Given course not found")
        await checkCourseNotChanged()
    })

    test('createMessage returns Given chatroom not found if message chat is not found', async () => {
        const user = await helpers.logIn("username")
        const course = await helpers.createCourse("uniqueName", "name", [])
        const chatRoom = await helpers.createChatRoom(course, "room name")
        const expectedMessage = {
            fromUser: {
                username: user.username,
                name: user.name,
                id: user.id
            },
            sendDate: new Date(Date.now()),
            content: "hello there",
        }
        const createMessageQuery = await helpers.makeQuery({query: createMessage, 
            variables: {courseUniqueName: course.uniqueName, chatRoomId: "abc1234", content: expectedMessage.content}})
        console.log(createMessageQuery)
        const message = createMessageQuery.data.createMessage
        expect(createMessageQuery.data.createMessage).toEqual(null)
        expect(createMessageQuery.errors[0].message).toEqual("Given chatroom not found")
        await checkCourseNotChanged()
    })
})

async function checkDataBaseInCorrectState(expectedMessage, user) {
    const coursesInDB = await Course.find({})
    expect(coursesInDB.length).toBe(1)

    const courseInDB = coursesInDB[0]
    expect(courseInDB.chatRooms.length).toBe(1)

    const chatRoomInDB = courseInDB.chatRooms[0]
    expect(chatRoomInDB.messages.length).toBe(1)

    const messageInDB = chatRoomInDB.messages[0]
    const messageObj = messageInDB.toObject()

    const dateInDB = messageObj.sendDate

    checkDateCorrect(dateInDB, expectedMessage)

    delete messageObj._id
    delete messageObj.sendDate
    expect(messageObj).toEqual({ ...expectedMessage, fromUser: user._id, sendDate: undefined })
}

function checkDateCorrect(messageInt, expectedMessage) {
    expect(new Date(messageInt).getFullYear()).toEqual(expectedMessage.sendDate.getFullYear())
    expect(new Date(messageInt).getMonth()).toEqual(expectedMessage.sendDate.getMonth())
    expect(new Date(messageInt).getDate()).toEqual(expectedMessage.sendDate.getDate())
    expect(new Date(messageInt).getMinutes()).toEqual(expectedMessage.sendDate.getMinutes())
}
