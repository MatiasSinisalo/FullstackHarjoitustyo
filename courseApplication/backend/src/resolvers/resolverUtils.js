const { UserInputError } = require("apollo-server-core")


const mustHaveToken = (context) => {
    if(!context.userForToken){
        throw new UserInputError("Unauthorized")
    }
}


module.exports={mustHaveToken}