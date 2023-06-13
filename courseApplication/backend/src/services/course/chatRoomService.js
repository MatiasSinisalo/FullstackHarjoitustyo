

const { UserInputError } = require('apollo-server-core')

const Course = require('../../models/course')
const { default: mongoose } = require('mongoose')
const { Task, Submission, Grade } = require('../../models/task')
const serviceUtils = require('../serviceUtils')
const { InfoPage, ContentBlock } = require('../../models/infoPage')
const { ChatRoom, Message } = require('../../models/chatRoom')


const createChatRoom = async (courseUniqueName, name, userForToken) => {
    const course = await serviceUtils.fetchCourse(courseUniqueName)
    serviceUtils.checkIsTeacher(course, userForToken)

    const chatRoom = {
        name: name,
        admin: userForToken.id,
        messages: [],
        users: [],
    }
    const chatRoomObj = new ChatRoom(chatRoom)
    console.log(chatRoomObj)
    course.chatRooms.push(chatRoomObj)
    await course.save()

    return {...chatRoomObj.toObject(), id: chatRoomObj._id.toString(), admin: {username: userForToken.username, name: userForToken.name, id: userForToken.id}}
}

const removeChatRoom = async (courseUniqueName, chatRoomId, userForToken) => {
    const course = await serviceUtils.fetchCourse(courseUniqueName)
    serviceUtils.checkIsTeacher(course, userForToken)

    const chatRoom = serviceUtils.findChatRoom(course, chatRoomId)

    const filteredChatRooms = course.chatRooms.filter((room) => room.id !== chatRoomId)
    course.chatRooms = filteredChatRooms
    await course.save()

    return true
}

const createMessage = async (courseUniqueName, chatRoomId, content, userForToken) => {
    const course = await serviceUtils.fetchCourse(courseUniqueName)
    serviceUtils.checkIsTeacher(course, userForToken)

    const chatRoom = serviceUtils.findChatRoom(course, chatRoomId)

    const message = {
        fromUser: userForToken.id,
        sendDate: new Date(Date.now()),
        content: content,
    }
    const messageObj = new Message(message)
    chatRoom.messages.push(messageObj)
    await course.save()
    return {...messageObj.toObject(), id: messageObj._id.toString(), fromUser: {username: userForToken.username, name: userForToken.name, id: userForToken.id}}
}

module.exports = {
    createChatRoom, 
    removeChatRoom,
    createMessage
}
