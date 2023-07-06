
const request = require('supertest')
const {Course} = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { createCourse, addTaskToCourse, removeCourse, addSubmissionToCourseTask, createChatRoom} = require('../courseTestQueries')
const { query } = require('express')
const mongoose = require('mongoose')
const helpers = require('../testHelpers')
const config = require('../../config')




const checkCourseNotChanged = async () => {
    const coursesInDB = await Course.find({})
    expect(coursesInDB.length).toBe(1)
    const courseInDB = coursesInDB[0]
    expect(courseInDB.chatRooms.length).toBe(0)
}

describe("createChatRoom tests", () => {
    test('createChatRoom creates chatRoom correctly', async () => {
        const user = await helpers.logIn("username")
        console.log(user._id.toString())
        const course = await helpers.createCourse("courseUniqueName", "name", [])
        const roomName = "name of chat room"
        const createChatRoomQuery = await helpers.makeQuery({query: createChatRoom, variables: {courseUniqueName: course.uniqueName, name: roomName}})
        delete createChatRoomQuery.data.createChatRoom.id
        
        const expectedObj = {
            name: roomName,
            admin: {
                username: user.username,
                name: user.name,
                id: user.id
            },
            messages: [],
            users: [],
        }
        expect(createChatRoomQuery.data.createChatRoom).toMatchObject(expectedObj)  
        

        const coursesInDB = await Course.find({})
        expect(coursesInDB.length).toBe(1)

        const courseInDB = coursesInDB[0]
        expect(courseInDB.chatRooms.length).toBe(1)

        const chatRoomInDB = courseInDB.chatRooms[0] 
        const chatRoomObj = chatRoomInDB.toObject()
        delete chatRoomObj._id
        await expect(chatRoomObj).toEqual({...expectedObj, admin: user._id})
    })
    test('createChatRoom returns Unauthorized if the user is not a teacher', async () => {
        const user = await helpers.logIn("username")
        console.log(user._id.toString())
        const course = await helpers.createCourse("courseUniqueName", "name", [])
        
        await helpers.logIn("students username")
        const roomName = "name of chat room"
        const createChatRoomQuery = await helpers.makeQuery({query: createChatRoom, variables: {courseUniqueName: course.uniqueName, name: roomName}})
         
        expect(createChatRoomQuery.data.createChatRoom).toBe(null)  
        expect(createChatRoomQuery.errors[0].message).toEqual("Unauthorized")  
        
        await checkCourseNotChanged()
    })
    test('createChatRoom returns given course not found if course is not found', async () => {
        const user = await helpers.logIn("username")
        console.log(user._id.toString())
        const course = await helpers.createCourse("courseUniqueName", "name", [])
        
        const roomName = "name of chat room"
        const createChatRoomQuery = await helpers.makeQuery({query: createChatRoom, 
            variables: {courseUniqueName: "does-not-exist", name: roomName}})
         
        expect(createChatRoomQuery.data.createChatRoom).toBe(null)  
        expect(createChatRoomQuery.errors[0].message).toEqual("Given course not found")  
        
        await checkCourseNotChanged()
    })
})