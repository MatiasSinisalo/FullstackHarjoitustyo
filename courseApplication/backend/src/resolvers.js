const User = require('./models/user')
const userService = require('./services/userService')

const resolvers  = {
    Query: {
        allUsers: async () => {
            const allUsers = User.find({})
            return allUsers
        }
    },
    Mutation: {
        createUser: async (root, args) => {
            const newUser = args
            const createdUser = userService.createNewUser(newUser.username, newUser.name, newUser.password)
            return createdUser
        }
    }
}


module.exports = resolvers