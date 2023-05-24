const { UserInputError } = require('apollo-server-core')
const User = require('../models/user')
const Course = require('../models/course')
const { default: mongoose } = require('mongoose')
const { Task, Submission, Grade } = require('../models/task')

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
      
        throw new UserInputError("Course uniqueName must be unique")
    }
}

const removeCourse = async(courseUniqueName, userForToken)=>{
    const courseToRemove = await Course.findOne({uniqueName: courseUniqueName}).populate("teacher")
    
    if(!courseToRemove)
    {
        throw new UserInputError("No given course found!")
    }

    if(courseToRemove.teacher.username !== userForToken.username){
        throw new UserInputError("Unauthorized")
    }
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
    const updatedCourse = await Course.findByIdAndUpdate(course.id, {students: newStudentList}, {new: true}).populate(['teacher', 'students', 'tasks'])
  
    return updatedCourse
    
    
}

const removeStudentFromCourse = async (studentUsername, courseUniqueName, userForToken) => {
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
        id: mongoose.Types.ObjectId(),
        description: taskDescription,
        deadline: new Date(deadline),
        submissions: []
    }

    const taskObj = new Task(newTask)
    course.tasks.push(taskObj)
    await course.save()
   
    return taskObj
}

const addSubmissionToCourseTask = async (courseUniqueName, taskID, content, submitted, userForToken) => {
    const course = await Course.findOne({uniqueName: courseUniqueName}).populate(["students", "tasks", "teacher"])
    if(!course)
    {
        throw new UserInputError("Given course not found")
    }
   
    const taskInCourse = course.tasks.find((task) => task._id.toString() === taskID)
    if(!taskInCourse)
    {
        throw new UserInputError("Given task not found")
    }

    const userInCourse = course.teacher.username === userForToken.username ? userForToken : course.students.find((user) => user.username === userForToken.username)
    if(!userInCourse)
    {
        throw new UserInputError("Given user is not participating in the course")
    }
   
    const userHasAlreadySubmitted = taskInCourse.submissions.find((submission) => submission.fromUser.toString() === userForToken.id)
    if(userHasAlreadySubmitted){
        throw new UserInputError("Given user is has already answered the question")
    }

    const newSubmission = {
        fromUser: userInCourse.id,
        content: content,
        submitted: submitted,
        submittedDate: submitted ? new Date(Date.now()) : null
    }
    const submissionObj = new Submission(newSubmission)
    taskInCourse.submissions.push(submissionObj)
    await course.save()
    await submissionObj.populate("fromUser")
    return submissionObj
}

const modifySubmission = async(courseUniqueName, taskId, submissionId, content, submitted, userForToken) => {
    const course = await Course.findOne({uniqueName: courseUniqueName})
    if(!course){
        throw new UserInputError("Given course not found")
    }

    const task = course.tasks.find((task) => task.id === taskId)
    if(!task){
        throw new UserInputError("Given task not found")
    }
    
    const submission = task.submissions.find((submission) => submission.id === submissionId)
    if(!submission){
        throw new UserInputError("Given submission not found")
    }

    if(submission.fromUser.toString() !== userForToken.id)
    {
        throw new UserInputError("Unauthorized")
    }

    if(submission.submitted)
    {
        throw new UserInputError("This submission has already been returned")
    }

    submission.content = content
    submission.submitted = submitted
    submission.submittedDate = submitted ? new Date(Date.now()) : null
    await course.save()
    return {...submission.toObject(), id: submission.id, fromUser: {id: userForToken.id, username: userForToken.username, name: userForToken.name}}

}

const removeTaskFromCourse = async (courseUniqueName, taskId, userForToken) =>{
    const course = await Course.findOne({uniqueName: courseUniqueName})
    if(!course){
        throw new UserInputError("Given course not found")
    }
  
    if(course.teacher.toString() !== userForToken.id)
    {
        throw new UserInputError("Unauthorized")
    }

    const task = course.tasks.find((task) => task.id === taskId)
    if(!task){
        throw new UserInputError("Given task not found")
    }

    const updatedTaskList = course.tasks.filter((task) => task.id != taskId)
    await Course.findByIdAndUpdate(course.id, {tasks: updatedTaskList}, {new: true})
    return true
}

const removeSubmissionFromCourseTask = async (courseUniqueName, taskId, submissionId, userForToken) => {
    const course = await Course.findOne({uniqueName: courseUniqueName})
    if(!course){
        throw new UserInputError("Given course not found")
    }

    const task = course.tasks.find((task) => task.id === taskId)
    if(!task){
        throw new UserInputError("Given task not found")
    }
    
    const submission = task.submissions.find((submission) => submission.id === submissionId)
    if(!submission){
        throw new UserInputError("Given submission not found")
    }

    if(submission.fromUser.toString() !== userForToken.id && course.teacher.toString() !== userForToken.id)
    {
        throw new UserInputError("Unauthorized")
    }

    task.submissions = task.submissions.filter((submission) => submission.id !== submissionId)
    await course.save()
    return true
}

const gradeSubmission = async (courseUniqueName, taskId, submissionId, points, date, userForToken) => {
    const course = await Course.findOne({uniqueName: courseUniqueName})
    if(!course){
        throw new UserInputError("Given course not found")
    }

    const task = course.tasks.find((task) => task.id === taskId)
    if(!task){
        throw new UserInputError("Given task not found")
    }
    
    const submission = task.submissions.find((submission) => submission.id === submissionId)
    if(!submission){
        throw new UserInputError("Given submission not found")
    }

    if(course.teacher.toString() !== userForToken.id)
    {
        throw new UserInputError("Unauthorized")
    }

    const grade = {
        points: points,
        date: new Date(Date.now())
    }
    const gradeObj = new Grade(grade)
    
    submission.grade = gradeObj
    await course.save()
    await course.populate({path: "tasks.submissions.fromUser", match: {id: submission.id}})
    return submission
}

module.exports = {  createCourse, 
                    removeCourse, 
                    addStudentToCourse,
                    addTaskToCourse, 
                    removeStudentFromCourse, 
                    addSubmissionToCourseTask, 
                    getAllCourses, 
                    getCourse, 
                    removeTaskFromCourse, 
                    removeSubmissionFromCourseTask,
                    modifySubmission,
                    gradeSubmission
                }