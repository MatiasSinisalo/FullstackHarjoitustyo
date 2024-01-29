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
        redirect_uri: 'https://frontend-ohtuprojekti-staging.ext.ocp-test-0.k8s.it.helsinki.fi/',
        grant_type: "authorization_code"
    })
    const idToken = result.data.id_token
    
    const decodedTokenRequest = await axios.post(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`)
    const googleIDToken = decodedTokenRequest.data 
    
    //this blob of code is proof of concept... TODO: refactor
    const userDBQuery = await User.findOne({accountType: 'google', thirdPartyID: googleIDToken.sub})
    if(userDBQuery){
        const userInfo = {
            username: userDBQuery.username,
            id: userDBQuery._id 
        }
        const appToken = await jwt.sign(userInfo, config.SECRET, {expiresIn: '1h'})
        return {type: 'TOKEN_LOGIN_SUCCESS', token: {value: appToken}}
    }
    else{
        console.log("starting account create progress")
        const email = googleIDToken.email
        const name = googleIDToken.name
        const thirdPartyID = googleIDToken.sub

        const userCreationInfo = {
            name: name,
            thirdPartyID: thirdPartyID
        }
        const userProfileCreationToken = jwt.sign(userCreationInfo, config.GOOGLE_CREATE_ACCOUNT_SECRET, {expiresIn: '1h'})

        return {type: 'TOKEN_CREATE_ACCOUNT', token: {value: userProfileCreationToken}}

    }

   

    return {}
}

const createGoogleUserAccount = async (username, verifiedCreateUserToken) => {
    const newUser = {
        accountType: 'google',
        username: username,
        name: verifiedCreateUserToken.name,
        thirdPartyID: verifiedCreateUserToken.thirdPartyID,
    }
    console.log(newUser)
    
    const userDBQuery = await User.findOne({accountType: 'google', thirdPartyID: newUser.thirdPartyID})
    console.log(userDBQuery)
    if(userDBQuery){
        throw new UserInputError("Given user account already exists")
    }

    try{
        const userObj = User(newUser)
        await userObj.save()
        return userObj    
    }
    catch(error){
        throw new UserInputError("Given username already exists")
    }
} 



const authenticateHYUser = async (HYUserToken) => {
   try{
        const result = await axios.post(`https://login-test.it.helsinki.fi/idp/profile/oidc/token`, {
            grant_type: 'authorization_code',   
            code: HYUserToken,
            client_id: config.HY_CLIENT_ID,
            client_secret: config.HY_CLIENT_SECRET,
            redirect_uri: 'https://frontend-ohtuprojekti-staging.ext.ocp-test-0.k8s.it.helsinki.fi/login/HY'
           
        },
        {headers:{'Content-Type': 'application/x-www-form-urlencoded'}})
        console.log(result)

        const access_Token = result.data.id_token
        const decodedTokenRequest = await axios.get(`https://login-test.it.helsinki.fi/idp/profile/oidc/userinfo?id_token=${access_Token}`)
        const HYUserData = decodedTokenRequest.data 
        console.log(HYUserData)
    }

    catch(e){
        console.log(e)
    }

   return {}
}


module.exports = {createNewUser, logIn, getUser, authenticateGoogleUser, createGoogleUserAccount, authenticateHYUser}