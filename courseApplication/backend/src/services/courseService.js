const { UserInputError } = require('apollo-server-core')
const User = require('../models/user')
const Course = require('../models/course')

const createCourse = async (uniqueName, name, teacherUsername) => {
    const teacherUser = await User.findOne({username:teacherUsername})
    if(!teacherUser)
    {
        throw new UserInputError('no user with given username found!')
    } 

    const teacherID = teacherUser.id
    
    const course = {
        uniqueName: uniqueName,
        name: name,
        teacher: teacherID,
        students: []
    }
    try{
        const courseModel = Course(course)
        const savedCourse = await courseModel.save()
        return  {...course, teacher: teacherUser}
    }
    catch(error)
    {
        throw new UserInputError("Course uniqueName must be unique")
    }
}

const addStudentToCourse = async (studentUsername, courseUniqueName) => {
    
    const studentUser = await User.findOne({username: studentUsername})
    if(!studentUser)
    {
        throw new UserInputError("Given username not found")
    }

    const course = await Course.findOne({uniqueName: courseUniqueName})
    if(!course)
    {
        throw new UserInputError("Given course not found")
    }

    
    if(course.students.find((studentId) => studentId.toString() === studentUser.id))
    {
        throw new UserInputError("Given user is already in the course")
    }
    
    const newStudentList = course.students.concat(studentUser.id)
    const updatedCourse = await Course.findOneAndUpdate(course.id, {students: newStudentList}, {new: true}).populate(['teacher', 'students'])
    return updatedCourse
    
    
}

removeStudentFromCourse = async (studentUsername, courseUniqueName) => {
    const studentUser = await User.findOne({username: studentUsername})
    if(!studentUser)
    {
        throw new UserInputError("Given username not found")
    }

    const course = await Course.findOne({uniqueName: courseUniqueName})
    if(!course)
    {
        throw new UserInputError("Given course not found")
    }

    
    if(!course.students.find((studentId) => studentId.toString() === studentUser.id))
    {
        throw new UserInputError("Given user is not in the course")
    }
    
    const newStudentList = course.students.filter((studentId) => studentId.toString() !== studentUser.id)
    const updatedCourse = await Course.findByIdAndUpdate(course.id, {students: newStudentList}, {new: true}).populate(['teacher', 'students'])
    return updatedCourse
}

module.exports = {createCourse, addStudentToCourse, removeStudentFromCourse}