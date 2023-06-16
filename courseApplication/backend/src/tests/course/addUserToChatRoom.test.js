
const request = require('supertest')
const Course = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { createCourse, addTaskToCourse, removeCourse, addSubmissionToCourseTask, createChatRoom, createMessage, addUserToChatRoom, addStudentToCourse} = require('../courseTestQueries')
const { query } = require('express')
const mongoose = require('mongoose')
const helpers = require('../testHelpers')
const config = require('../../config')


const checkCourseNotChanged = async () => {
    const coursesInDB = await Course.find({}).populate("chatRooms.users")
    expect(coursesInDB.length).toBe(1)

    const courseInDB = coursesInDB[0]
    expect(courseInDB.chatRooms.length).toBe(1)

    const chatRoomInDB = courseInDB.chatRooms[0]
    expect(chatRoomInDB.users.length).toBe(0)
}

describe('addUserToChatRoom tests', () => {
    test('addUserToChatRoom adds user correctly to chat room if the user is an admin', async () => {
        const user = await helpers.logIn("username")
        const course = await helpers.createCourse("uniqueName", "name", [])
        const chatRoom = await helpers.createChatRoom(course, "room name")
        const addStudentQuery = await helpers.makeQuery({query: addStudentToCourse, variables: {courseUniqueName: course.uniqueName, addStudentToCourseUsername: "students username"}})
        
        const addUserToChatRoomQuery = await helpers.makeQuery({query: addUserToChatRoom, 
            variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id, username: "students username"}})
        expect(addUserToChatRoomQuery.data.addUserToChatRoom).toBe(true)

        const coursesInDB = await Course.find({}).populate("chatRooms.users")
        expect(coursesInDB.length).toBe(1)

        const courseInDB = coursesInDB[0]
        expect(courseInDB.chatRooms.length).toBe(1)

        const chatRoomInDB = courseInDB.chatRooms[0]
        expect(chatRoomInDB.users.length).toBe(1)

        const userInChatRoom = chatRoomInDB.users[0]
        expect(userInChatRoom.username).toBe("students username")
    })

    test('addUserToChatRoom returns Unauthorized if the user is not an admin', async () => {
        const user = await helpers.logIn("username")
        const course = await helpers.createCourse("uniqueName", "name", [])
        const chatRoom = await helpers.createChatRoom(course, "room name")
        await helpers.makeQuery({query: addStudentToCourse, variables: {courseUniqueName: course.uniqueName, addStudentToCourseUsername: "students username"}})
        
        await helpers.logIn("students username")
        const addUserToChatRoomQuery = await helpers.makeQuery({query: addUserToChatRoom, 
            variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id, username: "students username"}})
        
        expect(addUserToChatRoomQuery.data.addUserToChatRoom).toBe(null)
        expect(addUserToChatRoomQuery.errors[0].message).toBe("Unauthorized")
      
        await checkCourseNotChanged()
    })

    test('addUserToChatRoom returns given course not found if the course is not found', async () => {
        const user = await helpers.logIn("username")
        const course = await helpers.createCourse("uniqueName", "name", [])
        const chatRoom = await helpers.createChatRoom(course, "room name")
        await helpers.makeQuery({query: addStudentToCourse, variables: {courseUniqueName: course.uniqueName, addStudentToCourseUsername: "students username"}})
        
        const addUserToChatRoomQuery = await helpers.makeQuery({query: addUserToChatRoom, 
            variables: {courseUniqueName: "not-found", chatRoomId: chatRoom.id, username: "students username"}})
        
        expect(addUserToChatRoomQuery.data.addUserToChatRoom).toBe(null)
        expect(addUserToChatRoomQuery.errors[0].message).toBe("Given course not found")
      
        await checkCourseNotChanged()
    })
    test('addUserToChatRoom returns given chat room not found if the chatroom is not found', async () => {
        const user = await helpers.logIn("username")
        const course = await helpers.createCourse("uniqueName", "name", [])
        const chatRoom = await helpers.createChatRoom(course, "room name")
        await helpers.makeQuery({query: addStudentToCourse, variables: {courseUniqueName: course.uniqueName, addStudentToCourseUsername: "students username"}})
        
        const addUserToChatRoomQuery = await helpers.makeQuery({query: addUserToChatRoom, 
            variables: {courseUniqueName: course.uniqueName, chatRoomId: "abc1234", username: "students username"}})
        
        expect(addUserToChatRoomQuery.data.addUserToChatRoom).toBe(null)
        expect(addUserToChatRoomQuery.errors[0].message).toBe("Given chatroom not found")
      
        await checkCourseNotChanged()
    })

    test('addUserToChatRoom returns given username not found if the username is not found', async () => {
        const user = await helpers.logIn("username")
        const course = await helpers.createCourse("uniqueName", "name", [])
        const chatRoom = await helpers.createChatRoom(course, "room name")
        await helpers.makeQuery({query: addStudentToCourse, variables: {courseUniqueName: course.uniqueName, addStudentToCourseUsername: "students username"}})
        
        const addUserToChatRoomQuery = await helpers.makeQuery({query: addUserToChatRoom, 
            variables: {courseUniqueName: course.uniqueName, chatRoomId:  chatRoom.id, username: "user that does not exist"}})
        
        expect(addUserToChatRoomQuery.data.addUserToChatRoom).toBe(null)
        expect(addUserToChatRoomQuery.errors[0].message).toBe("Given username not found")
      
        await checkCourseNotChanged()
    })

    test('addUserToChatRoom returns given user is not participating if the user is not a student', async () => {
        const user = await helpers.logIn("username")
        const course = await helpers.createCourse("uniqueName", "name", [])
        const chatRoom = await helpers.createChatRoom(course, "room name")
         
        const addUserToChatRoomQuery = await helpers.makeQuery({query: addUserToChatRoom, 
            variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id, username: "students username"}})
        
        expect(addUserToChatRoomQuery.data.addUserToChatRoom).toBe(null)
        expect(addUserToChatRoomQuery.errors[0].message).toBe("Given user is not participating in the course")
      
        await checkCourseNotChanged()
    })

})