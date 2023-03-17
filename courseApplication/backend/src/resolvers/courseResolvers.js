const { UserInputError } = require('apollo-server-core')
const courseService = require('../services/courseService')
const Course = require('../models/course')

const courseQueryResolvers = {
    allCourses: async (root, args, context) => {
        const courses = await Course.find({}).populate(['teacher', 'students'])
        return courses
    },
    getCourse: async (root, args, context) => {
        const course = await Course.findOne({uniqueName: args.uniqueName}).populate(['teacher', 'students'])
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
        const updatedCourse = await courseService.addTaskToCourse(courseUniqueName, description, deadline, context.userForToken)

        return updatedCourse

    },
}

module.exports = {courseQueryResolvers, courseMutationResolvers}