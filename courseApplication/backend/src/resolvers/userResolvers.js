const { UserInputError } = require('apollo-server-core')
const userService = require('../services/userService')
const User = require('../models/user')
const { mustHaveToken } = require('./resolverUtils')
const { default: axios } = require('axios')
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = require('../config')


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
        console.log("startcode")
        console.log(googleCode)

        const result = await axios.post('https://oauth2.googleapis.com/token', {
            code: googleCode,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: 'http://localhost:3000/',
            grant_type: "authorization_code"
        })
        console.log("request result")
        console.log(result)




        return {}
    }

}

module.exports = {userQueryResolvers, userMutationResolvers}