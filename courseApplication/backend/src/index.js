const config = require('./config')
const { ApolloServer, gql } = require('apollo-server')
const resolvers = require('./resolvers')
const typeDefs = require('./typedefs')
const context = require('./context')
const mongoose = require ('mongoose')

mongoose.connect(config.MONGODB_URI).then(() => {
    console.log("connected to database")
})


const start = () => {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context
    })
    
    server.listen().then(({url}) => {
        console.log(`server ready at ${url}`)
    })
}






start()