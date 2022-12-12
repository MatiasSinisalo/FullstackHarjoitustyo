require("dotenv").config()
const { ApolloServer, gql } = require('apollo-server')
const resolvers = require('./resolvers')
const typeDefs = require('./typedefs')
const User = require('./models/user')
const mongoose = require ('mongoose')
const bcrypt = require('bcrypt')



mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("connected to database")
})


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