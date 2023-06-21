const { addStudentToCourse, addUserToChatRoom, removeUserFromChatRoom } = require('../courseTestQueries')
const helpers = require('../testHelpers')
const Course = require('../../models/course')

const checkNothingChanged = async (expectedUserCount=1) => {
    const coursesInDB = await Course.find({})
    expect(coursesInDB.length).toBe(1)
    
    const courseInDB = coursesInDB[0]
    expect(courseInDB.chatRooms.length).toBe(1)

    const chatRoomInDB = courseInDB.chatRooms[0]
    expect(chatRoomInDB.users.length).toBe(expectedUserCount)
}

describe('removeUserFromChatRoom tests', () => {
    test('removeUserFromChatRoom removes user from room correctly', async () => {
        const user = await helpers.logIn("username", "12345")
        const course = await helpers.createCourse("courseUniqueName", "name", [])
        const chatRoom = await helpers.createChatRoom(course, "nameOfRoom")

        const addUser =  await helpers.makeQuery({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: course.uniqueName}})
        await helpers.makeQuery({query: addUserToChatRoom, variables: {username: "students username", courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id}})

        const removeQuery = await helpers.makeQuery({query: removeUserFromChatRoom, variables: {username: "students username", courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id}})
        expect(removeQuery.data.removeUserFromChatRoom).toBe(true)
        
        const coursesInDB = await Course.find({})
        expect(coursesInDB.length).toBe(1)
        
        const courseInDB = coursesInDB[0]
        expect(courseInDB.chatRooms.length).toBe(1)

        const chatRoomInDB = courseInDB.chatRooms[0]
        expect(chatRoomInDB.users.length).toBe(0)

    })
    test('removeUserFromChatRoom allows user to remove itself from chatroom', async () => {
        const user = await helpers.logIn("username", "12345")
        const course = await helpers.createCourse("courseUniqueName", "name", [])
        const chatRoom = await helpers.createChatRoom(course, "nameOfRoom")

        await helpers.makeQuery({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: course.uniqueName}})
        await helpers.makeQuery({query: addUserToChatRoom, variables: {username: "students username", courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id}})

        await helpers.logIn("students username")
        const removeQuery = await helpers.makeQuery({query: removeUserFromChatRoom, variables: {
            username: "students username", courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id}})
        expect(removeQuery.data.removeUserFromChatRoom).toBe(true)
       
        const coursesInDB = await Course.find({})
        expect(coursesInDB.length).toBe(1)
        
        const courseInDB = coursesInDB[0]
        expect(courseInDB.chatRooms.length).toBe(1)

        const chatRoomInDB = courseInDB.chatRooms[0]
        expect(chatRoomInDB.users.length).toBe(0)
    })
    test('removeUserFromChatRoom returns Unauthorized if user is not admin and trying to remove somebody else', async () => {
        const user = await helpers.logIn("username", "12345")
        const course = await helpers.createCourse("courseUniqueName", "name", [])
        const chatRoom = await helpers.createChatRoom(course, "nameOfRoom")

        await helpers.makeQuery({query: addStudentToCourse, variables: {addStudentToCourseUsername: "username", courseUniqueName: course.uniqueName}})
        await helpers.makeQuery({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: course.uniqueName}})
        await helpers.makeQuery({query: addUserToChatRoom, variables: {username: "students username", courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id}})

        await helpers.logIn("students username")
        const removeQuery = await helpers.makeQuery({query: removeUserFromChatRoom, variables: {
            username: "username", courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id}})
        expect(removeQuery.data.removeUserFromChatRoom).toBe(null)
        expect(removeQuery.errors[0].message).toEqual("Unauthorized")
        
       await checkNothingChanged()
    })
    test('removeUserFromChatRoom returns given user is not participating in the course if user is trying to remove a user that is not in the course', async () => {
        const user = await helpers.logIn("username", "12345")
        const course = await helpers.createCourse("courseUniqueName", "name", [])
        const chatRoom = await helpers.createChatRoom(course, "nameOfRoom")
  
        const removeQuery = await helpers.makeQuery({query: removeUserFromChatRoom, variables: {
            username: "students username", courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id}})
        expect(removeQuery.data.removeUserFromChatRoom).toBe(null)
        expect(removeQuery.errors[0].message).toEqual("Given user is not participating in the course")
        
       await checkNothingChanged(0)
    })
    test('removeUserFromChatRoom returns given user is not in chatroom if user is trying to remove a user that is not the chatroom', async () => {
        const user = await helpers.logIn("username", "12345")
        const course = await helpers.createCourse("courseUniqueName", "name", [])
        const chatRoom = await helpers.createChatRoom(course, "nameOfRoom")

        await helpers.makeQuery({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: course.uniqueName}})
        
        const removeQuery = await helpers.makeQuery({query: removeUserFromChatRoom, variables: {
            username: "students username", courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id}})
        expect(removeQuery.data.removeUserFromChatRoom).toBe(null)
        expect(removeQuery.errors[0].message).toEqual("Given user is not in chatroom")
        
       await checkNothingChanged(0)
    })
    test('removeUserFromChatRoom returns given course not found if course is not found', async () => {
        const user = await helpers.logIn("username", "12345")
        const course = await helpers.createCourse("courseUniqueName", "name", [])
        const chatRoom = await helpers.createChatRoom(course, "nameOfRoom")

        await helpers.makeQuery({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: course.uniqueName}})
        
        const removeQuery = await helpers.makeQuery({query: removeUserFromChatRoom, variables: {
            username: "students username", courseUniqueName: "course not found", chatRoomId: chatRoom.id}})
        expect(removeQuery.data.removeUserFromChatRoom).toBe(null)
        expect(removeQuery.errors[0].message).toEqual("Given course not found")
        
       await checkNothingChanged(0)
    })
    test('removeUserFromChatRoom returns given username not found if user to remove is not found', async () => {
        const user = await helpers.logIn("username", "12345")
        const course = await helpers.createCourse("courseUniqueName", "name", [])
        const chatRoom = await helpers.createChatRoom(course, "nameOfRoom")

        await helpers.makeQuery({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: course.uniqueName}})
        
        const removeQuery = await helpers.makeQuery({query: removeUserFromChatRoom, variables: {
            username: "does not exist", courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id}})
        expect(removeQuery.data.removeUserFromChatRoom).toBe(null)
        expect(removeQuery.errors[0].message).toEqual("Given username not found")
        
       await checkNothingChanged(0)
    })
    test('removeUserFromChatRoom returns given chatroom not found if chatroom is not found', async () => {
        const user = await helpers.logIn("username", "12345")
        const course = await helpers.createCourse("courseUniqueName", "name", [])
        const chatRoom = await helpers.createChatRoom(course, "nameOfRoom")

        await helpers.makeQuery({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: course.uniqueName}})
        
        const removeQuery = await helpers.makeQuery({query: removeUserFromChatRoom, variables: {
            username: "students username", courseUniqueName: course.uniqueName, chatRoomId: "abc1234"}})
        expect(removeQuery.data.removeUserFromChatRoom).toBe(null)
        expect(removeQuery.errors[0].message).toEqual("Given chatroom not found")
        
       await checkNothingChanged(0)
    })
})