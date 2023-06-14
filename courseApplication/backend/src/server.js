const { ApolloServer } = require('apollo-server')
const resolvers = require('./resolvers')
const typeDefs = require('./typedefs')
const context = require('./context')
const config = require('./config')
const mongoose = require ('mongoose')



const startServer = async () => {
    const apolloServer =  new ApolloServer({
        typeDefs,
        resolvers,
        context
    })

    await mongoose.connect(config.MONGODB_URI)
    console.log("connected to database")

    const {url} = await apolloServer.listen(config.PORT)
    console.log(`server is at ${url}`)

    return {apolloServer}
}

const server = {
    apolloServer: new ApolloServer({
        typeDefs,
        resolvers,
        context
    }),
    mongoose: mongoose,
    start: async function(readyMsg) {
        await this.mongoose.connect(config.MONGODB_URI)
        console.log("connected to database")

        const {url} = await this.apolloServer.listen(config.PORT)
        console.log(`${readyMsg}`)
        console.log(`server is at ${url}`)
        
    },
    stop: async function(){
        await this.mongoose.connection.close()
        await this.apolloServer.stop()
    }

}

module.exports = {server, apolloServer: server.apolloServer, startServer}