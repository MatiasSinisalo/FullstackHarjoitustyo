const { UserInputError } = require('apollo-server-core')
const User = require('./models/user')
const Course = require('./models/course')
const userService = require('./services/userService')

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
        createCourse: async (root, args) => {
            const uniqueName = args.uniqueName
            const name = args.name
            const teacherUsername = args.teacher

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
                students: []
            }
            const courseModel = Course(course)
            const savedCourse = await courseModel.save()

            return {...course, teacher: teacherUser}
        }


    }
}


module.exports = resolvers