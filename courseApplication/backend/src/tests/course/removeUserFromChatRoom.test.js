const { addStudentToCourse, addUserToChatRoom, removeUserFromChatRoom } = require('../courseTestQueries')
const helpers = require('../testHelpers')
const Course = require('../../models/course')


describe('removeUserFromChatRoom tests', () => {
    test('removeUserFromChatRoom removes user from room correctly', async () => {
        const user = await helpers.logIn("username", "12345")
        const course = await helpers.createCourse("courseUniqueName", "name", [])
        const chatRoom = await helpers.createChatRoom(course, "nameOfRoom")

        const addUser =  await helpers.makeQuery({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: course.uniqueName}})
        await helpers.makeQuery({query: addUserToChatRoom, variables: {username: "students username", courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id}})

        const removeQuery = await helpers.makeQuery({query: removeUserFromChatRoom, variables: {username: "students username", courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id}})
        console.log(removeQuery)
        expect(removeQuery.data.removeUserFromChatRoom).toBe(true)
        

        const coursesInDB = await Course.find({})
        expect(coursesInDB.length).toBe(1)
        
        const courseInDB = coursesInDB[0]
        expect(courseInDB.chatRooms.length).toBe(1)

        const chatRoomInDB = courseInDB.chatRooms[0]
        expect(chatRoomInDB.users.length).toBe(0)

    })
})