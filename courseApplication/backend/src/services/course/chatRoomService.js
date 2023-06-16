

const { UserInputError } = require('apollo-server-core')

const Course = require('../../models/course')
const { default: mongoose } = require('mongoose')
const { Task, Submission, Grade } = require('../../models/task')
const serviceUtils = require('../serviceUtils')
const { InfoPage, ContentBlock } = require('../../models/infoPage')
const { ChatRoom, Message } = require('../../models/chatRoom')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

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

const addUserToChatRoom = async (courseUniqueName, chatRoomId, username, userForToken) => {
    const course = await serviceUtils.fetchCourse(courseUniqueName)
    const user = await serviceUtils.fetchUser(username)
    const chatRoom = await serviceUtils.findChatRoom(course, chatRoomId)
    
    if(chatRoom.admin.toString() !== userForToken.id)
    {
        throw new UserInputError("Unauthorized")
    }
    
    if(!serviceUtils.isStudent(course, user.id))
    {
        throw new UserInputError("Given user is not participating in the course")
    }

    chatRoom.users.push(user.id)
    await course.save()
    return true
}

const createMessage = async (courseUniqueName, chatRoomId, content, userForToken) => {
    const course = await serviceUtils.fetchCourse(courseUniqueName)
    
    const chatRoom = serviceUtils.findChatRoom(course, chatRoomId)

    const isAdmin = chatRoom.admin.toString() === userForToken.id
    const isParticipant = chatRoom.users.find((user) => user.toString() == userForToken.id) ? true : false

    if(!isAdmin && !isParticipant)
    {
        throw new UserInputError("Unauthorized")
    }

    const message = {
        fromUser: userForToken.id,
        sendDate: new Date(Date.now()),
        content: content,
    }
    const messageObj = new Message(message)
    chatRoom.messages.push(messageObj)
    await course.save()
    const messageCreated = {...messageObj.toObject(), id: messageObj._id.toString(), fromUser: {username: userForToken.username, name: userForToken.name, id: userForToken.id}}
    return messageCreated
}

const subscribeToCreatedMessages = async (courseUniqueName, chatRoomId, content, userForToken) => {

    return pubsub.asyncIterator('MESSAGE_CREATED')
}

module.exports = {
    createChatRoom, 
    removeChatRoom,
    createMessage,
    addUserToChatRoom,
    subscribeToCreatedMessages
}
