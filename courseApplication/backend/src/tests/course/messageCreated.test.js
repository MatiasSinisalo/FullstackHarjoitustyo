const { courseSubscriptionResolvers } = require("../../resolvers/courseResolvers")
const { createMessage } = require("../courseTestQueries")
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
})

const waitForTimeOut = (ms) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("stopped waiting for subscription")
            resolve()
        }, ms);
    })
}