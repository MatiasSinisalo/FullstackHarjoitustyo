require("dotenv").config()
const { ApolloServer, gql } = require('apollo-server')
const resolvers = require('./resolvers')
const User = require('./models/user')
const mongoose = require ('mongoose')
const bcrypt = require('bcrypt')



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