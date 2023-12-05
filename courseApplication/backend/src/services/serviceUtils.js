const { default: mongoose } = require('mongoose')
const { Task, Submission, Grade } = require('../models/task')
const { UserInputError } = require('apollo-server-core')
const User = require('../models/user')
const {Course} = require('../models/course')


const fetchCourse = async (courseUniqueName, populateCommand) => {
    const course = populateCommand ? 
                    await Course.findOne({uniqueName: courseUniqueName}).populate(populateCommand) :
                    await Course.findOne({uniqueName: courseUniqueName})
    if(!course){
        throw new UserInputError("Given course not found")
    }
    return course;
}

const fetchUser = async (username, populateCommand) => {
    const user = populateCommand ? 
                    await User.findOne({username: username}).populate(populateCommand): 
                    await User.findOne({username: username})
    if(!user)
    {
        throw new UserInputError("Given username not found")
    }
    return user
}

const findTask = (course, taskId) => {
    const taskInCourse = course.tasks.textTasks.find((task) => task._id.toString() === taskId)
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

const checkIsParticipant = (chatRoom, userToFind) => {
    const isParticipant = chatRoom.users.find((user) => user.toString() == userToFind.id) ? true : false
    if(!isParticipant)
    {
        throw new UserInputError("Given user is not in chatroom")
    }
    return true
}

const checkIsAdminOrParticipant = (chatRoom, userForToken) => {
    const isAdmin = chatRoom.admin.toString() === userForToken.id
    const isParticipant = chatRoom.users.find((user) => user.toString() == userForToken.id) ? true : false

    if(!isAdmin && !isParticipant)
    {
        throw new UserInputError("Unauthorized")
    }

    return true
}

const isTeacher = (course, userForToken) => {
    return course.teacher.toString() === userForToken.id
}

const isStudent = (course, userId) => {
    const student = course.students.find(((student) => student.toString() === userId))
    return student ? true : false
}


const checkUserNotInChatRoom = (chatRoom, userId) => {
    const userInRoom = chatRoom.users.find((user) => user.toString() === userId)
    if(userInRoom)
    {
        throw new UserInputError("Given user is already in chatroom")
    }
}

const checkIsStudent = (course, userId) => {
    if(!isStudent(course, userId))
    {
        return new UserInputError("Unauthorized")
    }
}

const getStudentsSubmissions = (task, userId) => {
    const submissions = task.submissions.filter((submission) => submission.fromUser.id === userId)
    return submissions
}

const findMultipleChoiceTask = (course, multipleChoiceTaskID) => {
    const multipleChoiceTask = course.tasks.multipleChoiceTasks.find((task) => task._id.toString() === multipleChoiceTaskID)
    if (multipleChoiceTask){
        return multipleChoiceTask
    }
    throw new UserInputError("Given task not found")
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
                isStudent,
                checkIsAdminOrParticipant,
                checkUserNotInChatRoom,
                checkIsParticipant,
                checkIsStudent,
                getStudentsSubmissions,
                findMultipleChoiceTask,
            }