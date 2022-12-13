const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../config')
const {UserInputError} = require('apollo-server')

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

    const userObj = User(userToSave)
    await userObj.save()

    delete(newUser.password)
    console.log(newUser)
    return newUser
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



module.exports = {createNewUser, logIn}