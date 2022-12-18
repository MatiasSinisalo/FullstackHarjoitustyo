const config = require("./config")
const User = require("./models/user")
const jwt = require('jsonwebtoken')
const context = async ({ req }) => {
   
   if(!req)
   {
    return null
   }
   
   console.log(req)
   const authorization = req.headers.authorization
   if(!authorization)
   {
    return null
   }
   
   if(authorization.toLowerCase().startsWith('bearer '))
   {
    const token = jwt.verify(authorization.substring(7), config.SECRET)
    const userForToken = await User.findById(token.id)
    console.log(userForToken)
    if(userForToken)
    {
        return {userForToken}
    }
   }

   return null
}

module.exports = context