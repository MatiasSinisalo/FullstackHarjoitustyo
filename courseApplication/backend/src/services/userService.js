const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../config')
const {UserInputError} = require('apollo-server')
const { default: axios } = require('axios')

const createNewUser = async (username, name, password) => {
    const newUser = {
        username: username,
        name: name,
        password: password
    }

    const hashedPassword = await bcrypt.hash(newUser.password, 10)
    const userToSave = {
        username: newUser.username,
        name: newUser.name,
        passwordHash: hashedPassword
    }
    try{
        const userObj = User(userToSave)
        await userObj.save()
        delete(newUser.password)
        return newUser
    }
    catch(error){
        throw new UserInputError("Given username already exists")
    }
  
}

const getUser = async (userId) => {
    const user = await User.findById(userId).populate(["teachesCourses", "attendsCourses"])
    return user
}

const logIn = async (username, password) => {
    const userInDatabase = await User.findOne({username: username})
  
    if(userInDatabase){
        const validPassword = await bcrypt.compare(password, userInDatabase.passwordHash)
       
        if(validPassword){
           
            const userInfo = {
                username: userInDatabase.username,
                id: userInDatabase._id
            }
            const token = await jwt.sign(userInfo, config.SECRET, {expiresIn: '1h'})
            return token

        }
    }

    throw new UserInputError("invalid username or password")
    return null
}


const authenticateGoogleUser = async (googleAuthCode) => {
    const result = await axios.post('https://oauth2.googleapis.com/token', {
        code: googleAuthCode,
        client_id: config.GOOGLE_CLIENT_ID,
        client_secret: config.GOOGLE_CLIENT_SECRET,
        redirect_uri: 'http://localhost:3000/',
        grant_type: "authorization_code"
    })
    const idToken = result.data.id_token
    
    const decodedTokenRequest = await axios.post(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`)
    const email = decodedTokenRequest.data.email

    return email
}



module.exports = {createNewUser, logIn, getUser, authenticateGoogleUser}