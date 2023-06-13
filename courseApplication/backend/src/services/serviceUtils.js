const { default: mongoose } = require('mongoose')
const { Task, Submission, Grade } = require('../models/task')
const { UserInputError } = require('apollo-server-core')
const User = require('../models/user')
const Course = require('../models/course')


const fetchCourse = async (courseUniqueName, populateCommand) => {
    const course = populateCommand ? 
                    await Course.findOne({uniqueName: courseUniqueName}).populate(populateCommand) :
                    await Course.findOne({uniqueName: courseUniqueName})
    if(!course){
        throw new UserInputError("Given course not found")
    }
    return course;
}

const fetchUser = async (username) => {
    const user = await User.findOne({username: username})
    if(!user)
    {
        throw new UserInputError("Given username not found")
    }
    return user
}

const findTask = (course, taskId) => {
    const taskInCourse = course.tasks.find((task) => task._id.toString() === taskId)
    if(!taskInCourse)
    {
        throw new UserInputError("Given task not found")
    }
    return taskInCourse
}

const findSubmission = (task, submissionId) => {
    const submission = task.submissions.find((submission) => submission.id === submissionId)
    if(!submission){
        throw new UserInputError("Given submission not found")
    }
    return submission
}

const findInfoPage = (course, infoPageId) => {
    const alreadyExistingInfoPage = course.infoPages.find((page) => page.id === infoPageId)
    if(!alreadyExistingInfoPage)
    {
        throw new UserInputError("Given info page not found")
    }
    return alreadyExistingInfoPage
}

const findContentBlock = (infoPage, contentBlockId) => {
    const contentBlock = infoPage.contentBlocks.find((block) => block.id === contentBlockId)
    if(!contentBlock)
    {
        throw new UserInputError("Given content block not found")
    }
    return contentBlock
}

const findChatRoom = (course, chatRoomId) => {
    const chatRoom = course.chatRooms.find((room) => room.id === chatRoomId)
    if(!chatRoom)
    {
        throw new UserInputError("Given chatroom not found")
    }
    return chatRoom
}

const validateDate = (date) => {
    
    const dateNumber = Date.parse(date)
    if(isNaN(dateNumber))
    {
        throw new UserInputError("Incorrect date")
    }

    const correctDate = new Date(dateNumber) 
    return correctDate
    
}

const checkIsTeacher = (course, userForToken) => {
    if(course.teacher.toString() !== userForToken.id)
    {
        throw new UserInputError("Unauthorized")
    }
    return true
}

const isTeacher = (course, userForToken) => {
    return course.teacher.toString() === userForToken.id
}

const isStudent = (course, userForToken) => {
    const student = course.students.find(((student) => student.id === userForToken.id))
    return student !== null
}


module.exports= {fetchCourse,
                fetchUser, 
                findTask, 
                findSubmission, 
                validateDate, 
                checkIsTeacher,
                findInfoPage,
                findContentBlock,
                findChatRoom,
                isTeacher,
                isStudent
            }