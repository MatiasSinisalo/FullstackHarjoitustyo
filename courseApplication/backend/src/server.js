const { ApolloServer } = require('apollo-server')
const resolvers = require('./resolvers')
const typeDefs = require('./typedefs')
const context = require('./context')
const config = require('./config')
const mongoose = require ('mongoose')



const server = {
    apolloServer: new ApolloServer({
        typeDefs,
        resolvers,
        context
    }),
    start: async function(readyMsg) {
        await mongoose.connect(config.MONGODB_URI)
        console.log("connected to database")

        const {url} = await this.apolloServer.listen()
        console.log(`${readyMsg}`)
        console.log(`server is at ${url}`)
        
    }

}

module.exports = server