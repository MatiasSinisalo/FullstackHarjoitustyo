const { UserInputError } = require('apollo-server-core')
const User = require('../models/user')
const {Course} = require('../models/course')
const { default: mongoose } = require('mongoose')
const { Task, Submission, Grade } = require('../models/task')
const serviceUtils = require('./serviceUtils')
const taskService = require('./course/taskService')
const submissionService = require('./course/submissionService')
const infoPageService = require('./course/infoPageService')
const chatRoomService = require('./course/chatRoomService')
const chatRoom = require('../models/chatRoom')
const getAllCourses = async (userForToken) => {
    const courses = await Course.find({}, {tasks: {textTasks: 0}, chatRooms: 0}).populate(["teacher"]).populate("students", null, {username: userForToken.username})
    return courses
}

const getCourse = async (courseUniqueName, userForToken) => {
    const course = await Course.findOne({uniqueName: courseUniqueName}).populate(["teacher", "students", "tasks.textTasks.submissions.fromUser", "chatRooms.messages.fromUser", "chatRooms.admin", "chatRooms.users"])
    if(course.teacher.username === userForToken.username)
    {
        return course
    }
    else
    {
        serviceUtils.checkIsStudent(course, userForToken.id)
        const textTasksWithFilteredSubmissions = course.tasks.textTasks.map((task) => {
            const usersSubmissions = serviceUtils.getStudentsSubmissions(task, userForToken.id)
            return {...task.toObject(), submissions: usersSubmissions, id: task.id}
        })

       

        const courseToReturn = {
            id: course.id,
            name: course.name,
            uniqueName: course.uniqueName,
            teacher: course.teacher,
            students: [userForToken],
            chatRooms: course.chatRooms,
            infoPages: course.infoPages,
            tasks: {
                textTasks: textTasksWithFilteredSubmissions
            }
        }
        
        
        return courseToReturn
    }

}

const createCourse = async (uniqueName, name, teacherUsername) => {
    const teacherUser = await serviceUtils.fetchUser(teacherUsername, "teachesCourses")

    const teacherID = teacherUser.id
    
    const course = {
        uniqueName: uniqueName,
        name: name,
        teacher: teacherID,
        students: [],
        tasks: {
            textTasks: []
        }
    }
  
    const courseAlreadyExistsWithName = await Course.findOne({uniqueName: uniqueName})
    if(courseAlreadyExistsWithName){
        throw new UserInputError("Course uniqueName must be unique")
    }

    try{
        const courseModel = new Course(course)
        const savedCourse = await courseModel.save()
        const returnCourse = {...savedCourse._doc, teacher: {username: teacherUser.username, name: teacherUser.name}, id: savedCourse._id.toString()}
        teacherUser.teachesCourses.push(savedCourse.id)
        await teacherUser.save()
        return  returnCourse
    }
    catch(error)
    {
        if(error.message.includes("Incorrect unique name"))
        {
            throw new UserInputError("Incorrect unique name")
        }
        else if(error.code === 11000)
        {
            throw new UserInputError("Course uniqueName must be unique")
        }
    }
}

const removeCourse = async(courseUniqueName, userForToken)=>{
    const courseToRemove = await serviceUtils.fetchCourse(courseUniqueName)
    
    
    serviceUtils.checkIsTeacher(courseToRemove, userForToken)
    const user = await serviceUtils.fetchUser(userForToken.username)
    try{
       

        const removedCourse = await Course.findByIdAndDelete(courseToRemove.id)
        
        const filteredCourses = user.teachesCourses.filter((ref) => ref.toString() !== removedCourse.id)
        user.teachesCourses = filteredCourses

        //remove reference to the removed course from all of the students attendsCourses ref lists
        courseToRemove.students.forEach(async (student) => {
            const result = await User.findByIdAndUpdate(student, {$pull: {attendsCourses: {$in: courseToRemove.id}}}, {new: true})
            console.log(result)
        })

        await user.save()
       
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
   
    studentUser.attendsCourses.push(course.id)
    await studentUser.save()

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

    const filteredCourses = studentUser.attendsCourses.filter((ref) => ref.toString() !== course.id)
    studentUser.attendsCourses = filteredCourses
    await studentUser.save()

    return updatedCourse
}

module.exports = {  createCourse, 
                    removeCourse, 
                    addStudentToCourse,
                    removeStudentFromCourse, 
                    getAllCourses, 
                    getCourse
                }