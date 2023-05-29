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

module.exports= {fetchCourse, findTask}