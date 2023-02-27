const { UserInputError } = require('apollo-server-core')
const User = require('./models/user')
const Course = require('./models/course')
const userService = require('./services/userService')
const courseService = require('./services/courseService')
const config = require('./config')

const resolvers  = {
    Query: {
        allUsers: async () => {
            const allUsers = await User.find({})
            return allUsers
        },
        me: async (root, args, context) => {
            if(!context.userForToken){
                throw new UserInputError("Unauthorized")
            }

            const currentUserInformation = userService.getUser(context.userForToken)
            return currentUserInformation
        },
        allCourses: async (root, args, context) => {
            const courses = await Course.find({}).populate(['teacher', 'students', 'tasks'])
            return courses
        }
    },
    Mutation: {
        createUser: async (root, args) => {
            const newUser = args
            const createdUser = userService.createNewUser(newUser.username, newUser.name, newUser.password)
            return createdUser
        },
        logIn: async (root, args) => {
            const username = args.username
            const password = args.password

            const token = userService.logIn(username, password)
            return {value: token}
        },
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
        reset: async(root, args, context) => {
            if(config.IS_TEST)
            {
                await Course.deleteMany({})
                await User.deleteMany({})
                return true
            }
            else
            {
                return false
            }
        }


    }
}


module.exports = resolvers