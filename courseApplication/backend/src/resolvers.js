const { UserInputError } = require('apollo-server-core')
const User = require('./models/user')
const userService = require('./services/userService')

const resolvers  = {
    Query: {
        allUsers: async () => {
            console.log("hello")
            const allUsers = await User.find({})
            console.log("there")
            return allUsers
        },
        me: async (root, args, context) => {
            if(!context.userForToken){
                throw new UserInputError("Unauthorized")
            }

            const currentUserInformation = userService.getUser(context.userForToken)
            return currentUserInformation
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
        }

    }
}


module.exports = resolvers