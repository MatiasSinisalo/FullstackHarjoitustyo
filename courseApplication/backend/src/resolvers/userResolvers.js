const { UserInputError } = require('apollo-server-core')
const userService = require('../services/userService')
const User = require('../models/user')
const { mustHaveToken } = require('./resolverUtils')

const userQueryResolvers = {
    
    allUsers: async () => {
        const allUsers = await User.find({})
        return allUsers
    },
    me: async (root, args, context) => {
        mustHaveToken(context)

        const currentUserInformation = userService.getUser(context.userForToken)
        return currentUserInformation
    },
    
}

const userMutationResolvers = {
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

    
    authenticateGoogleUser: async(root, args)=>{
        const googleCode = args.google_token
        
        token = userService.authenticateGoogleUser(googleCode)
        
        return {value: token}
    }

}

module.exports = {userQueryResolvers, userMutationResolvers}