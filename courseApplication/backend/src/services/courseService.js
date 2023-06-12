const { UserInputError } = require('apollo-server-core')
const User = require('../models/user')
const Course = require('../models/course')
const { default: mongoose } = require('mongoose')
const { Task, Submission, Grade } = require('../models/task')
const serviceUtils = require('./serviceUtils')
const taskService = require('./course/taskService')
const submissionService = require('./course/submissionService')
const infoPageService = require('./course/infoPageService')
const getAllCourses = async (userForToken) => {
    const courses = await Course.find({}, {tasks: 0}).populate(["teacher"]).populate("students", null, {username: userForToken.username})
    return courses
}

const getCourse = async(courseUniqueName, userForToken) => {
    const course = await Course.findOne({uniqueName: courseUniqueName}).populate(["teacher"])
    if(course.teacher.username === userForToken.username)
    {
        const courseToReturn = await course.populate(["students", "tasks.submissions.fromUser"])
        return courseToReturn
    }
    else
    {
        const courseFiltered = await course.populate("students", null, {username: userForToken.username})
        courseFiltered.tasks = courseFiltered.tasks.map((task) => {
            return {...task, submissions: task.submissions.filter((submission) => submission.fromUser == userForToken.id)}
        })
        
        const courseToReturn = await courseFiltered.populate("tasks.submissions.fromUser")
        return courseToReturn
    }

}

const createCourse = async (uniqueName, name, teacherUsername) => {
    const teacherUser = await serviceUtils.fetchUser(teacherUsername)

    const teacherID = teacherUser.id
    
    const course = {
        uniqueName: uniqueName,
        name: name,
        teacher: teacherID,
        students: [],
        tasks: []
    }
    try{
        const courseModel = new Course(course)
        const savedCourse = await courseModel.save()
        const returnCourse = {...savedCourse._doc, teacher: {username: teacherUser.username, name: teacherUser.name}, id: savedCourse._id.toString()}
        return  returnCourse
    }
    catch(error)
    {
      
        throw new UserInputError("Course uniqueName must be unique")
    }
}

const removeCourse = async(courseUniqueName, userForToken)=>{
    const courseToRemove = await serviceUtils.fetchCourse(courseUniqueName)

    serviceUtils.checkIsTeacher(courseToRemove, userForToken)
    try{
        const removedCourse = await Course.findByIdAndDelete(courseToRemove.id)
        return true
    }
    catch(error)
    {
        return false
    }
}

const addStudentToCourse = async (studentUsername, courseUniqueName, userForToken) => {
    
    const studentUser = await serviceUtils.fetchUser(studentUsername)

    
    const course = await serviceUtils.fetchCourse(courseUniqueName)
    
    //only teacher can add any student or student can join by their own accord
    if(userForToken.id !== course.teacher.toString() && studentUser.username !== userForToken.username)
    {
        throw new UserInputError("Unauthorized")
    }

    if(course.students.find((studentId) => studentId.toString() === studentUser.id))
    {
        throw new UserInputError("Given user is already in the course")
    }
    
    const newStudentList = course.students.concat(studentUser.id)
    const updatedCourse = await Course.findByIdAndUpdate(course.id, {students: newStudentList}, {new: true}).populate(['teacher', 'students', 'tasks'])
  
    return updatedCourse
    
    
}

const removeStudentFromCourse = async (studentUsername, courseUniqueName, userForToken) => {
    const studentUser = await serviceUtils.fetchUser(studentUsername)

    const course =  await serviceUtils.fetchCourse(courseUniqueName)
    //only teacher can remove any student or student can leave by their own accord
    if(userForToken.id !== course.teacher.toString() && studentUser.username !== userForToken.username)
    {
        throw new UserInputError("Unauthorized")
    }

    if(!course.students.find((studentId) => studentId.toString() === studentUser.id))
    {
        throw new UserInputError("Given user is not in the course")
    }
    
    const newStudentList = course.students.filter((studentId) => studentId.toString() !== studentUser.id)
    const updatedCourse = await Course.findByIdAndUpdate(course.id, {students: newStudentList}, {new: true}).populate(['teacher', 'students'])
    return updatedCourse
}

module.exports = {  createCourse, 
                    removeCourse, 
                    addStudentToCourse,
                    removeStudentFromCourse, 
                    getAllCourses, 
                    getCourse,
                    submissions: submissionService,
                    tasks: taskService,
                    infoPages: infoPageService
                }