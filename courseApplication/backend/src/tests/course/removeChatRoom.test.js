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



const checkCourseHasChatRoom = async (chatRoom) => {
    const coursesInDB = await Course.find({})
    expect(coursesInDB.length).toBe(1)
    const courseInDB = coursesInDB[0]
    expect(courseInDB.chatRooms.length).toBe(1) 
}

describe('removeChatRoom tests', () => {
    test('removeChatRoom removes chat room correctly', async () => {
        await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("courseUniqueName", "name", [], apolloServer)
        const chatRoom = await helpers.createChatRoom(course, "room", apolloServer)

        const removeChatRoomQuery = await apolloServer.executeOperation({query: removeChatRoom, 
            variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id}})
        expect(removeChatRoomQuery.data.removeChatRoom).toBe(true)

        const coursesInDB = await Course.find({})
        expect(coursesInDB.length).toBe(1)
        const courseInDB = coursesInDB[0]
        expect(courseInDB.chatRooms.length).toBe(0) 
    })
    test('removeChatRoom returns Unauthorized if user is not teacher', async () => {
        await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("courseUniqueName", "name", [], apolloServer)
        const chatRoom = await helpers.createChatRoom(course, "room", apolloServer)
        
        await helpers.logIn("students username", apolloServer)
        const removeChatRoomQuery = await apolloServer.executeOperation({query: removeChatRoom, 
            variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id}})
        expect(removeChatRoomQuery.data.removeChatRoom).toBe(null)
        expect(removeChatRoomQuery.errors[0].message).toBe("Unauthorized")

        await checkCourseHasChatRoom(chatRoom)
    })
    test('removeChatRoom returns given course not found if course is not found', async () => {
        await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("courseUniqueName", "name", [], apolloServer)
        const chatRoom = await helpers.createChatRoom(course, "room", apolloServer)
        
        const removeChatRoomQuery = await apolloServer.executeOperation({query: removeChatRoom, 
            variables: {courseUniqueName: "doesNotExist", chatRoomId: chatRoom.id}})
        expect(removeChatRoomQuery.data.removeChatRoom).toBe(null)
        expect(removeChatRoomQuery.errors[0].message).toBe("Given course not found")

        await checkCourseHasChatRoom(chatRoom)
    })
    test('removeChatRoom returns given chatroom not found if chatRoom is not found', async () => {
        await helpers.logIn("username", apolloServer)
        const course = await helpers.createCourse("courseUniqueName", "name", [], apolloServer)
        const chatRoom = await helpers.createChatRoom(course, "room", apolloServer)
        
        const removeChatRoomQuery = await apolloServer.executeOperation({query: removeChatRoom, 
            variables: {courseUniqueName: course.uniqueName, chatRoomId: "abd1234"}})
        expect(removeChatRoomQuery.data.removeChatRoom).toBe(null)
        expect(removeChatRoomQuery.errors[0].message).toBe("Given chatroom not found")

        await checkCourseHasChatRoom(chatRoom)
    })
})