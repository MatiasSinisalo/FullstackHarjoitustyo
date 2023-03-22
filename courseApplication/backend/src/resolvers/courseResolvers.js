const { UserInputError } = require('apollo-server-core')
const courseService = require('../services/courseService')
const Course = require('../models/course')

const courseQueryResolvers = {
    allCourses: async (root, args, context) => {
        if(!context.userForToken){
            throw new UserInputError("Unauthorized")
        }
        const courses = await courseService.getAllCourses(context.userForToken)
        return courses
    },
    getCourse: async (root, args, context) => {
        if(!context.userForToken){
            throw new UserInputError("Unauthorized")
        }

        const uniqueName = args.uniqueName
        const course = await courseService.getCourse(uniqueName, context.userForToken)
        return course
    }
}

const courseMutationResolvers = {
    createCourse: async (root, args, context) => {
        if(!context.userForToken){
            throw new UserInputError("Unauthorized")
        }

        const uniqueName = args.uniqueName
        const name = args.name
        const teacherUsername = context.userForToken.username

        const course = await courseService.createCourse(uniqueName, name, teacherUsername)
        return course
    },
    removeCourse: async(root, args, context)=>{
        if(!context.userForToken)
        {
            throw new UserInputError("Unauthorized")
        }
        const uniqueName = args.uniqueName
        const removalSuccess = await courseService.removeCourse(uniqueName, context.userForToken)
        return removalSuccess
    }, 
    addStudentToCourse: async (root, args, context) => {
        if(!context.userForToken){
            throw new UserInputError("Unauthorized")
        }

        const studentUsername = args.username
        const courseUniqueName = args.courseUniqueName
        const courseWithNewStudents = await courseService.addStudentToCourse(studentUsername, courseUniqueName, context.userForToken)

        return courseWithNewStudents
    },
    removeStudentFromCourse: async(root, args, context) => {
        if(!context.userForToken)
        {
            throw new UserInputError("Unauthorized")
        }

        
        const studentUsername = args.username
        const courseUniqueName = args.courseUniqueName
        const updatedCourse = await courseService.removeStudentFromCourse(studentUsername, courseUniqueName, context.userForToken)

        return updatedCourse

    },
    addTaskToCourse: async(root, args, context) => {
        if(!context.userForToken)
        {
            throw new UserInputError("Unauthorized")
        }

      
        const courseUniqueName = args.courseUniqueName
        const description = args.description
        const deadline = args.deadline
        const newTask = await courseService.addTaskToCourse(courseUniqueName, description, deadline, context.userForToken)

        return newTask

    },
    addSubmissionToCourseTask: async(root, args, context) => {
        if(!context.userForToken)
        {
            throw new UserInputError("Unauthorized")
        }
        const courseUniqueName = args.courseUniqueName
        const content = args.content
        const submitted = args.submitted
        const taskID = args.taskId
        
        const createdSubmission = await courseService.addSubmissionToCourseTask(courseUniqueName, taskID, content, submitted, context.userForToken)
        
        return createdSubmission
    }
}

module.exports = {courseQueryResolvers, courseMutationResolvers}