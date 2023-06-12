const { UserInputError } = require('apollo-server-core')
const User = require('../models/user')
const Course = require('../models/course')
const { default: mongoose } = require('mongoose')
const { Task, Submission, Grade } = require('../models/task')
const serviceUtils = require('./serviceUtils')

const fetchCourse = async (courseUniqueName, populateCommand) => {
    const course = populateCommand ? 
                    await Course.findOne({uniqueName: courseUniqueName}).populate(populateCommand) :
                    await Course.findOne({uniqueName: courseUniqueName})
    if(!course){
        throw new UserInputError("Given course not found")
    }
    return course;
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

module.exports= {fetchCourse, 
                findTask, 
                findSubmission, 
                validateDate, 
                checkIsTeacher,
                findInfoPage}