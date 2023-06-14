const { ApolloServer } = require('@apollo/server')
const resolvers = require('./resolvers')
const typeDefs = require('./typedefs')
const context = require('./context')
const config = require('./config')
const mongoose = require ('mongoose')
const express = require('express')
const {expressMiddleware} = require('@apollo/server/express4')
const cors = require('cors')
const {json} = require('body-parser')
const http = require('http')
const {ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')
const startServer = async () => {
    const app = express()
    const httpServer = http.createServer(app)

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/',
      })

    const schema =  makeExecutableSchema({ typeDefs, resolvers })
    const serverCleanUp = useServer({schema}, wsServer)

    const apolloServer =  new ApolloServer({
        schema,
        plugins: [
        ApolloServerPluginDrainHttpServer({httpServer}),
        {
            async serverWillStart(){
                return{
                    async drainServer(){
                        await serverCleanUp.dispose()
                    },
                };
            },
        },
        ]
    })
   

    await mongoose.connect(config.MONGODB_URI)
    console.log("connected to database")

    await apolloServer.start()
    app.use('/', cors(), express.json(), expressMiddleware(apolloServer, {context}));
    httpServer.listen({ port: config.PORT });
    console.log("server is working")
   
    return {apolloServer, app, httpServer}
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

module.exports = {startServer}