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
        returnValue.then((data) => {
            console.log(data)
        })
        const message = await helpers.makeQuery({query: createMessage, variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id, content: "hello there"}})
        
    })
})