require("dotenv").config()
const { ApolloServer, gql } = require('apollo-server')
const User = require('./models/user')
const mongoose = require ('mongoose')
const bcrypt = require('bcrypt')

const userService = require('./services/userService')

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("connected to database")
})



//const typeDefs = require('./typedefs')
//const resorvers = require('./resorvers')
let exampleUser = {
    username: "username",
    name: "test"
}




const typeDefs = gql`
    type User{
        username: String!
        name: String!
    }

    
    type Query{
        allUsers: [User!]!
    }


    type Mutation{
        createUser(
            username: String!
            name: String!
            password: String!
        ):User
    }

`
const resolvers  = {
    Query: {
        allUsers: async () => {
            const allUsers = User.find({})
            return allUsers
        }
    },
    Mutation: {
        createUser: async (root, args) => {
            const newUser = args
            const createdUser = userService.createNewUser(newUser.username, newUser.name, newUser.password)
            return createdUser
        }
    }
}





const start = () => {
    const server = new ApolloServer({
        typeDefs,
        resolvers ,
    })
    
    server.listen().then(({url}) => {
        console.log(`server ready at ${url}`)
    })
}




start()