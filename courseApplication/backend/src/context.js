const config = require("./config")
const User = require("./models/user")
const jwt = require('jsonwebtoken')
const normalContext = async ({ req }) => {
   if(!req)
   {
    return {userForToken: null}
   }
   
   const authorization = req.headers.authorization
   const context = await verifyUserFromToken(authorization)
   return context
   
}

const subscriptionContext = async (ctx, msg, args) => {
    console.log("---finding token----")
    console.log(ctx)
    const auth = ctx?.connectionParams?.Authorization
    const context = await verifyUserFromToken(auth) 
    return context
}

const verifyUserFromToken = async (authorization) => {
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


module.exports = {normalContext, subscriptionContext}