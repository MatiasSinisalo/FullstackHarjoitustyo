const { UserInputError } = require('apollo-server-core')
const courseService = require('../services/courseService')
const {Course} = require('../models/course')
const { mustHaveToken } = require('./resolverUtils')
const  {pubsub} = require('../publisher')
const { withFilter } = require('graphql-subscriptions')
const { chatRoomResolvers, chatRoomSubscriptionResolvers } = require('./course/chatRoomResolvers')
const {taskResolvers} = require('./course/taskResolvers')
const {infoPageResolvers} = require('./course/infoPageResolvers')
const courseQueryResolvers = {
    allCourses: async (root, args, context) => {
        mustHaveToken(context)
        const courses = await courseService.getAllCourses(context.userForToken)
        return courses
    },
    getCourse: async (root, args, context) => {
        mustHaveToken(context)

        const uniqueName = args.uniqueName
        const course = await courseService.getCourse(uniqueName, context.userForToken)
        return course
    }
}

const courseMutationResolvers = {
    createCourse: async (root, args, context) => {
        mustHaveToken(context)

        const uniqueName = args.uniqueName
        const name = args.name
        const teacherUsername = context.userForToken.username

        const course = await courseService.createCourse(uniqueName, name, teacherUsername)
        return course
    },
    removeCourse: async(root, args, context)=>{
        mustHaveToken(context)
        const uniqueName = args.uniqueName
        const removalSuccess = await courseService.removeCourse(uniqueName, context.userForToken)
        return removalSuccess
    }, 
    addStudentToCourse: async (root, args, context) => {
        mustHaveToken(context)

        const studentUsername = args.username
        const courseUniqueName = args.courseUniqueName
        const courseWithNewStudents = await courseService.addStudentToCourse(studentUsername, courseUniqueName, context.userForToken)

        return courseWithNewStudents
    },
    removeStudentFromCourse: async(root, args, context) => {
        mustHaveToken(context)

        
        const studentUsername = args.username
        const courseUniqueName = args.courseUniqueName
        const updatedCourse = await courseService.removeStudentFromCourse(studentUsername, courseUniqueName, context.userForToken)

        return updatedCourse

    },
    ...infoPageResolvers,
    ...taskResolvers,
    ...chatRoomResolvers,   
}

const courseSubscriptionResolvers = {
   ...chatRoomSubscriptionResolvers
}
module.exports = {courseQueryResolvers, courseMutationResolvers, courseSubscriptionResolvers}