
const courseService = require('../../services/courseService')
const { mustHaveToken } = require('../resolverUtils')



const taskResolvers = {
    addTaskToCourse: async(root, args, context) => {
        mustHaveToken(context)

      
        const courseUniqueName = args.courseUniqueName
        const description = args.description
        const deadline = args.deadline
        const maxGrade = args?.maxGrade
        const newTask = await courseService.tasks.addTaskToCourse(courseUniqueName, description, deadline, maxGrade, context.userForToken)
        
        return newTask

    },
    removeTaskFromCourse: async (root, args, context) => {
        mustHaveToken(context)

        const courseUniqueName = args.courseUniqueName
        const taskId = args.taskId
        const taskRemoved = await courseService.tasks.removeTaskFromCourse(courseUniqueName, taskId, context.userForToken)
        return taskRemoved

    },
    addSubmissionToCourseTask: async(root, args, context) => {
        mustHaveToken(context)
        const courseUniqueName = args.courseUniqueName
        const content = args.content
        const submitted = args.submitted
        const taskID = args.taskId
        
        const createdSubmission = await courseService.submissions.addSubmissionToCourseTask(courseUniqueName, taskID, content, submitted, context.userForToken)
        
        return createdSubmission
    },
    modifySubmission: async(root, args, context) => {
        mustHaveToken(context)

        const courseUniqueName = args.courseUniqueName
        const taskID = args.taskId
        const submissionId = args.submissionId
        const content = args.content
        const submitted = args.submitted
        const modifiedSubmission = await courseService.submissions.modifySubmission(courseUniqueName, taskID, submissionId, content, submitted, context.userForToken)
        return modifiedSubmission
        
    },
    removeSubmissionFromCourseTask: async(root, args, context) =>{
        mustHaveToken(context)
        const courseUniqueName = args.courseUniqueName
        const taskId = args.taskId
        const submissionId = args.submissionId
        const submissionRemoved = await courseService.submissions.removeSubmissionFromCourseTask(courseUniqueName, taskId, submissionId, context.userForToken)
        return submissionRemoved
    },
    gradeSubmission: async(root, args, context) => {
        mustHaveToken(context)
        const courseUniqueName = args.courseUniqueName
        const taskId = args.taskId
        const submissionId = args.submissionId
        const points = args.points
        const gradedSubmission = await courseService.submissions.gradeSubmission(courseUniqueName, taskId, submissionId, points, context.userForToken)
        return gradedSubmission

    },
    createMultipleChoiceTask: async(root, args, context) => {
        mustHaveToken(context)
        const courseUniqueName = args.courseUniqueName
        const description = args.description
        const deadline = args.deadline
        const newMultipleChoiceTask = await courseService.tasks.addMultipleChoiceTask(courseUniqueName, description, deadline, context.userForToken)
        return newMultipleChoiceTask
    },
}

module.exports = {taskResolvers}