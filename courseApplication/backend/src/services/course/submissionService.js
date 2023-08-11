const { UserInputError } = require('apollo-server-core')

const {Course} = require('../../models/course')
const { default: mongoose } = require('mongoose')
const { Task, Submission, Grade } = require('../../models/task')
const serviceUtils = require('../serviceUtils')


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

const modifySubmission = async(courseUniqueName, taskId, submissionId, content, submitted, userForToken) => {
    const course = await serviceUtils.fetchCourse(courseUniqueName)

    const task = serviceUtils.findTask(course, taskId)
    
    const submission = serviceUtils.findSubmission(task, submissionId)

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





const gradeSubmission = async (courseUniqueName, taskId, submissionId, points, userForToken) => {
    const course = await serviceUtils.fetchCourse(courseUniqueName)

    const task = serviceUtils.findTask(course, taskId)
    
    const submission = serviceUtils.findSubmission(task, submissionId)

    serviceUtils.checkIsTeacher(course, userForToken)

    const grade = {
        points: points,
        date: new Date(Date.now())
    }
    const gradeObj = new Grade(grade)
    
    submission.grade = gradeObj
    await course.save()
    await course.populate({path: "tasks.textTasks.submissions.fromUser", match: {id: submission.id}})
    return submission
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
    modifySubmission,
    gradeSubmission,
    removeSubmissionFromCourseTask,
    addSubmissionToCourseTask
}