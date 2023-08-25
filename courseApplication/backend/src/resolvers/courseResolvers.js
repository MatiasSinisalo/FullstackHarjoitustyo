const { UserInputError } = require('apollo-server-core')
const courseService = require('../services/courseService')
const {Course} = require('../models/course')
const { mustHaveToken } = require('./resolverUtils')
const  {pubsub} = require('../publisher')
const { withFilter } = require('graphql-subscriptions')

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
    addInfoPageToCourse: async(root, args, context) => {
        mustHaveToken(context)
        const courseUniqueName = args.courseUniqueName
        const locationUrl = args.locationUrl
        const newInfoPage = await courseService.infoPages.addInfoPage(courseUniqueName, locationUrl, context.userForToken)
        return newInfoPage
    },
    removeInfoPageFromCourse: async(root, args, context) => {
        mustHaveToken(context)
        const courseUniqueName = args.courseUniqueName
        const infoPageId = args.infoPageId
        const removed = await courseService.infoPages.removeInfoPage(courseUniqueName, infoPageId, context.userForToken)
        return removed
    },
    addContentBlockToInfoPage: async(root, args, context) => {
        mustHaveToken(context)
        const courseUniqueName = args.courseUniqueName
        const infoPageId = args.infoPageId
        const content = args.content
        const position = args.position
        const newContentBloc = await courseService.infoPages.addContentBlock(courseUniqueName, infoPageId, content, position, context.userForToken)
        return newContentBloc
    },
    modifyContentBlock: async(root, args, context) => {
        mustHaveToken(context)
        const courseUniqueName = args.courseUniqueName
        const infoPageId = args.infoPageId
        const contentBlockId = args.contentBlockId
        const content = args.content
        const modifiedContentBlock = await courseService.infoPages.modifyContentBlock(courseUniqueName, infoPageId, contentBlockId, content, context.userForToken)
        return modifiedContentBlock
    },
    removeContentBlockFromInfoPage: async(root, args, context) => {
        mustHaveToken(context)
        const courseUniqueName = args.courseUniqueName
        const infoPageId = args.infoPageId
        const contentBlockId = args.contentBlockId
        const removed = await courseService.infoPages.removeContentBlock(courseUniqueName, infoPageId, contentBlockId, context.userForToken)
        return removed

    },
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
    createChatRoom: async(root, args, context) => {
        mustHaveToken(context)
        const courseUniqueName = args.courseUniqueName
        const name = args.name
        const newChatRoom = await courseService.chatRooms.createChatRoom(courseUniqueName, name, context.userForToken);
        return newChatRoom
    },
    addUserToChatRoom: async (root, args, context) => {
        mustHaveToken(context)
        const courseUniqueName = args.courseUniqueName
        const chatRoomId = args.chatRoomId
        const username = args.username
        const added = await courseService.chatRooms.addUserToChatRoom(courseUniqueName, chatRoomId, username, context.userForToken)
        return added
    },
    removeUserFromChatRoom: async(root, args, context) => {
        mustHaveToken(context)
        const courseUniqueName = args.courseUniqueName
        const chatRoomId = args.chatRoomId
        const username = args.username
        const removed = await courseService.chatRooms.removeUserFromChatRoom(courseUniqueName, chatRoomId, username, context.userForToken)
        return removed
    },
    removeChatRoom: async(root, args, context) => {
        mustHaveToken(context)
        const courseUniqueName = args.courseUniqueName
        const chatRoomId = args.chatRoomId
        const removed = await courseService.chatRooms.removeChatRoom(courseUniqueName, chatRoomId, context.userForToken);
        return removed
    },
    createMessage: async(root, args, context) => {
        mustHaveToken(context)
        const courseUniqueName = args.courseUniqueName
        const chatRoomId = args.chatRoomId
        const content = args.content
        const newMessage = await courseService.chatRooms.createMessage(courseUniqueName, chatRoomId, content, context.userForToken)
        pubsub.publish('MESSAGE_CREATED', { messageCreated: {...newMessage, sendDate: newMessage.sendDate.getTime().toString()}, information: {courseUniqueName, chatRoomId} })
        return newMessage
    },
    createMultipleChoiceTask: async(root, args, context) => {
        mustHaveToken(context)
        const courseUniqueName = args.courseUniqueName
        const description = args.description
        const deadline = args.deadline
        
        return null
    }
}

const courseSubscriptionResolvers = {
    //using subscriptions with a withFilter function:
    //https://www.apollographql.com/docs/apollo-server/data/subscriptions/ 
    messageCreated: {
        async subscribe(root, args, context) {
           
            mustHaveToken(context)
            const courseUniqueName = args.courseUniqueName
            const chatRoomId = args.chatRoomId
            await courseService.chatRooms.checkCanSubscribeToMessageCreated(courseUniqueName, chatRoomId, context.userForToken);

            //very important, Do not forget to return withFilter(...)(root, args, context) because otherwise it will give the folowwing error:
            //Error: Subscription field must return Async Iterable
            //credits: https://github.com/apollographql/graphql-subscriptions/issues/161
            return withFilter(
                () => pubsub.asyncIterator('MESSAGE_CREATED'), 
                async (payload, args, context) => {
                    return Boolean(payload.information.chatRoomId === args.chatRoomId)
                }
                )(root, args, context);
          },
    }

}
module.exports = {courseQueryResolvers, courseMutationResolvers, courseSubscriptionResolvers}