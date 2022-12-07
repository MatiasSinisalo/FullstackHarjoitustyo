const { ApolloServer, gql } = require('apollo-server')
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
        user: User
    }

`
const resolvers  = {
    Query: {
        user: () => exampleUser
      }
}




const start = () => {

    
}

const server = new ApolloServer({
    typeDefs,
    resolvers ,
})

server.listen().then(({url}) => {
    console.log(`server ready at ${url}`)
})


start()