const config = require("./config")
const User = require("./models/user")
const jwt = require('jsonwebtoken')
const context = async ({ req }) => {
   if(!req)
   {
    return {userForToken: null}
   }
   console.log("req")
   const authorization = req.headers.authorization
   if(!authorization)
   {
    return {userForToken: null}
   }
   
   if(authorization.toLowerCase().startsWith('bearer '))
   {
    //jwt verify can fail and cause internal server error if the token is invalid
    try
    {
        const token = jwt.verify(authorization.substring(7), config.SECRET)
        const userForToken = await User.findById(token.id)
        if(userForToken)
        {
            return {userForToken}
        }
    }
    catch
    {
        return {userForToken: null}   
    }

   }

   return {userForToken: null}
   
}

module.exports = context