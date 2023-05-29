const { UserInputError } = require('apollo-server-core')

const Course = require('../../models/course')
const { default: mongoose } = require('mongoose')
const { Task, Submission, Grade } = require('../../models/task')
const serviceUtils = require('../serviceUtils')

const addTaskToCourse = async (courseUniqueName, taskDescription, deadline, userForToken) => {
    const course = await serviceUtils.fetchCourse(courseUniqueName)
    //only teacher should be able to add a task to the course
    if(userForToken.id !== course.teacher.toString())
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
    const course = await serviceUtils.fetchCourse(courseUniqueName, ["students", "tasks", "teacher"])
   
    const taskInCourse = serviceUtils.findTask(course, taskID)

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


const removeTaskFromCourse = async (courseUniqueName, taskId, userForToken) =>{
    const course = await serviceUtils.fetchCourse(courseUniqueName)
  
    if(course.teacher.toString() !== userForToken.id)
    {
        throw new UserInputError("Unauthorized")
    }

    
    const task = serviceUtils.findTask(course, taskId)

    const updatedTaskList = course.tasks.filter((task) => task.id != taskId)
    await Course.findByIdAndUpdate(course.id, {tasks: updatedTaskList}, {new: true})
    return true
}

const removeSubmissionFromCourseTask = async (courseUniqueName, taskId, submissionId, userForToken) => {
    const course = await serviceUtils.fetchCourse(courseUniqueName)

    const task = serviceUtils.findTask(course, taskId)
    
    const submission = serviceUtils.findSubmission(task, submissionId)

    if(submission.fromUser.toString() !== userForToken.id && course.teacher.toString() !== userForToken.id)
    {
        throw new UserInputError("Unauthorized")
    }

    task.submissions = task.submissions.filter((submission) => submission.id !== submissionId)
    await course.save()
    return true
}





module.exports = {  
                    addTaskToCourse, 
                    removeTaskFromCourse, 
                    addSubmissionToCourseTask, 
                    removeSubmissionFromCourseTask,
                }