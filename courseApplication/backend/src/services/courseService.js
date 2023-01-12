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
    const courseModel = Course(course)
    const savedCourse = await courseModel.save()
    return  {...course, teacher: teacherUser}
}

module.exports = {createCourse}