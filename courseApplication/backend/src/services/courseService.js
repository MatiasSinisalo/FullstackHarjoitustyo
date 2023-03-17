const { UserInputError } = require('apollo-server-core')
const User = require('../models/user')
const Course = require('../models/course')
const { default: mongoose } = require('mongoose')

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
        console.log(error)
        throw new UserInputError("Course uniqueName must be unique")
    }
}

const addStudentToCourse = async (studentUsername, courseUniqueName, userForToken) => {
    
    const studentUser = await User.findOne({username: studentUsername})
    if(!studentUser)
    {
        throw new UserInputError("Given username not found")
    }

    
    const course = await Course.findOne({uniqueName: courseUniqueName}).populate("teacher")
    if(!course)
    {
        throw new UserInputError("Given course not found")
    }
    
    //only teacher can add any student or student can join by their own accord
    if(userForToken.username !== course.teacher.username && studentUser.username !== userForToken.username)
    {
        throw new UserInputError("Unauthorized")
    }

    if(course.students.find((studentId) => studentId.toString() === studentUser.id))
    {
        throw new UserInputError("Given user is already in the course")
    }
    
    const newStudentList = course.students.concat(studentUser.id)
    const updatedCourse = await Course.findByIdAndUpdate(course.id, {students: newStudentList}, {new: true}).populate(['teacher', 'students'])
    return updatedCourse
    
    
}

removeStudentFromCourse = async (studentUsername, courseUniqueName, userForToken) => {
    const studentUser = await User.findOne({username: studentUsername})
    if(!studentUser)
    {
        throw new UserInputError("Given username not found")
    }

    const course = await Course.findOne({uniqueName: courseUniqueName}).populate("teacher")
    if(!course)
    {
        throw new UserInputError("Given course not found")
    }

    //only teacher can remove any student or student can leave by their own accord
    if(userForToken.username !== course.teacher.username && studentUser.username !== userForToken.username)
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

const addTaskToCourse = async (courseUniqueName, taskDescription, deadline, userForToken) => {
    const course = await Course.findOne({uniqueName: courseUniqueName}).populate("teacher")
    if(!course)
    {
        throw new UserInputError("Given course not found")
    }

    //only teacher should be able to add a task to the course
    if(userForToken.username !== course.teacher.username)
    {
        throw new UserInputError("Unauthorized")
    }

    const newTask = {
        description: taskDescription,
        deadline: new Date(deadline),
        submissions: []
    }

    const updatedTaskList = course.tasks.concat(newTask)
    const updatedCourse = await Course.findByIdAndUpdate(course.id, {tasks: updatedTaskList}, {new: true})
    return updatedCourse

}

const addSubmissionToCourseTask = async (courseUniqueName, taskID, content, submitted, userForToken) => {
    const course = await Course.findOne({uniqueName: courseUniqueName}).populate("students")
    if(!course)
    {
        throw new UserInputError("Given course not found")
    }
    console.log(course)
    console.log("course found")
    console.log(course.tasks)
    console.log(taskID)
    console.log(course.tasks[0].id.toString())
    const taskInCourse = course.tasks.find((task) => task._id.toString() === taskID)
    console.log(taskInCourse)
    if(!taskInCourse)
    {
        throw new UserInputError("Given task not found")
    }
    console.log("task found")
    console.log(course.students)
    const userInCourse = course.students.find((user) => user.username === userForToken.username)
    if(!userInCourse)
    {
        throw new UserInputError("Given user is not participating in the course!")
    }
    console.log("user found")
    const newSubmission = {
        id: new mongoose.Types.ObjectId(),
        content: content,
        submitted: submitted
    }
    const newSubmissionList = taskInCourse.submissions.concat(newSubmission)
    const updatedCourse = await Course.findByIdAndUpdate(course.id, {tasks: {submissions: newSubmissionList}})
    return newSubmission
    

}

module.exports = {createCourse, addStudentToCourse, addTaskToCourse, removeStudentFromCourse, addSubmissionToCourseTask}