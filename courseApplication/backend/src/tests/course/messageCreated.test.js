
const { courseSubscriptionResolvers } = require("../../resolvers/courseResolvers")
const { createMessage, addStudentToCourse, addUserToChatRoom } = require("../courseTestQueries")
const helpers = require('../testHelpers')

describe('messageCreated subscription tests', () => {
    test('messageCreated allows subscription', async () => {
        const user = await helpers.logIn("username", "12345")
        const course = await helpers.createCourse("courseUnqiueName","courseName", [])
        const chatRoom = await helpers.createChatRoom(course, "chatRoomName")

        const result = await courseSubscriptionResolvers.messageCreated.subscribe({}, {courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id}, {userForToken: user})
        
        const returnValue = result.next()
        console.log(returnValue)
       
        const message = await helpers.makeQuery({query: createMessage, variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id, content: "hello there"}})
        returnValue.then((data) => {
            const msg = data.value.messageCreated
            delete msg._id
            expect(data.value.messageCreated).toEqual(message.data.createMessage)
        }) 
    })

    test('messageCreated only returns messages from the subscribed chatroom', async () => {
        const user = await helpers.logIn("username", "12345")
        const course = await helpers.createCourse("courseUnqiueName","courseName", [])
        const chatRoom = await helpers.createChatRoom(course, "chatRoomName")
        const chatRoomSecond = await helpers.createChatRoom(course, "secondChatRoom")

        const result = await courseSubscriptionResolvers.messageCreated.subscribe({}, {courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id}, {userForToken: user})
        
        const returnValue = result.next()
        console.log(returnValue)
       
        const message = await helpers.makeQuery({query: createMessage, variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoomSecond.id, content: "hello there"}})

        returnValue.then((data) => {
            console.log(data)
            const msg = data.value.messageCreated
            delete msg._id
            expect(data).toBe("should not be returned")
        }) 
        //sleep for 1second to wait if the new message went to the subscription
        await waitForTimeOut(1000)
       
    })
    test('messageCreated only returns error Unauthorized if user is not admin or participant', async () => {
        const user = await helpers.logIn("username", "12345")
        const course = await helpers.createCourse("courseUnqiueName","courseName", [])
        const chatRoom = await helpers.createChatRoom(course, "chatRoomName")
      
        const studentUser = await helpers.logIn("students username", "12345")
        courseSubscriptionResolvers.messageCreated.subscribe({}, {courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id}, {userForToken: studentUser})
        .catch((err) => {
            console.log(err)
            expect(err.message).toContain("Unauthorized")
        })
        .then((result) => {
            expect(result).toBe(undefined)
        })
        await waitForTimeOut(1000)
        
       
    })
    test('messageCreated only allows chatroomUser that is not admin to subscribe and receive messages', async () => {
        const user = await helpers.logIn("username", "12345")
        const course = await helpers.createCourse("courseUnqiueName","courseName", [])
        const chatRoom = await helpers.createChatRoom(course, "chatRoomName")
        await helpers.makeQuery({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: course.uniqueName}})
        await helpers.makeQuery({query: addUserToChatRoom, variables: {username: "students username", courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id}})
       
        const studentUser = await helpers.logIn("students username", "12345")
        const result = await courseSubscriptionResolvers.messageCreated.subscribe({}, {courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id}, {userForToken: studentUser})
        const returnValueToStudent = result.next()

        await helpers.logIn("username", "12345")
        const messageByTeacher = await helpers.makeQuery({query: createMessage, variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id, content: "hello there"}})

        returnValueToStudent.then((data) => {
            const msg = data.value.messageCreated
            delete msg._id
            expect(data.value.messageCreated).toEqual(messageByTeacher.data.createMessage)
        }) 

        await waitForTimeOut(1000)
        
       
    })

    test('messageCreated returns given course not found if course is missing', async () => {
        const user = await helpers.logIn("username", "12345")
        const course = await helpers.createCourse("courseUnqiueName","courseName", [])
        const chatRoom = await helpers.createChatRoom(course, "chatRoomName")
      
        courseSubscriptionResolvers.messageCreated.subscribe({}, {courseUniqueName: "not found", chatRoomId: chatRoom.id}, {userForToken: user})
        .catch((err) => {
            console.log(err)
            expect(err.message).toContain("Given course not found")
        })
        .then((result) => {
            expect(result).toBe(undefined)
        })
        await waitForTimeOut(1000)
        
    })

    test('messageCreated returns given chatroom not found if charroom is missing', async () => {
        const user = await helpers.logIn("username", "12345")
        const course = await helpers.createCourse("courseUnqiueName","courseName", [])
        const chatRoom = await helpers.createChatRoom(course, "chatRoomName")
      
        courseSubscriptionResolvers.messageCreated.subscribe({}, {courseUniqueName: course.uniqueName, chatRoomId: "abc1234"}, {userForToken: user})
        .catch((err) => {
            console.log(err)
            expect(err.message).toContain("Given chatroom not found")
        })
        .then((result) => {
            expect(result).toBe(undefined)
        })
        await waitForTimeOut(1000)
        
    })
})

const waitForTimeOut = (ms) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("stopped waiting for subscription")
            resolve()
        }, ms);
    })
}