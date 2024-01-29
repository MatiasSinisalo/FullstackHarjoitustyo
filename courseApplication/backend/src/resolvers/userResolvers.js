const { UserInputError } = require('apollo-server-core')
const userService = require('../services/userService')
const User = require('../models/user')
const { mustHaveToken } = require('./resolverUtils')
const jwt = require('jsonwebtoken')
const { GOOGLE_CREATE_ACCOUNT_SECRET } = require('../config')

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
        
        authenticateResult = await userService.authenticateGoogleUser(googleCode)
        
        return authenticateResult
    },

    finalizeGoogleUserCreation: async(root, args, context) => {
        const username = args.username
        const createUserToken = args.createUserToken

        const verifiedCreateUserToken = jwt.verify(createUserToken, GOOGLE_CREATE_ACCOUNT_SECRET)
        if(verifiedCreateUserToken){
            const user = await userService.createGoogleUserAccount(username, verifiedCreateUserToken)
            return user
        }
        else{
            throw new UserInputError("Unauthorized")
        }

    },
    authenticateHYUser: async(root, args)=>{
        const HYCode = args.HY_token
        
        authenticateResult = await userService.authenticateHYUser(HYCode)
        
        return authenticateResult
    },

}

module.exports = {userQueryResolvers, userMutationResolvers}