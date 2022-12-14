const { UserInputError } = require('apollo-server-core')
const User = require('./models/user')
const Course = require('./models/course')
const userService = require('./services/userService')
const courseService = require('./services/courseService')

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
            const courses = await Course.find({}).populate('teacher')
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
        }


    }
}


module.exports = resolvers