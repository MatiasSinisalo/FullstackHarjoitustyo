
//source for testing an application that uses graphQL:  https://www.apollographql.com/docs/apollo-server/testing/testing/

const typeDefs = require('../typedefs')
const resolvers = require('../resolvers')
const config = require('../config')

const User = require('../models/user')


const userCreateQuery = 'mutation Mutation {  createUser(password: "12345", name: "name", username: "username") {    name    username  }}'
const allUsersQuery = 'query AllUsers {  allUsers {    name    username  }}'

const { ApolloServer, gql } = require('apollo-server')

const testServer = new ApolloServer({
    typeDefs,
    resolvers,
});


const mongoose = require ('mongoose')
mongoose.set('strictQuery', false)


beforeAll(async () => {
   const url = await testServer.listen()
   await mongoose.connect(config.MONGODB_URI)
   
   //we use different database for tests, lets clear the database
   await User.deleteMany({})


   console.log(`test server ready`)
})

describe('user tests', () => {

    test('user create query returns and saves created user correctly', async () => {  
       
        const response = await testServer.executeOperation({query: userCreateQuery, variables: {}})
        console.log(response)
        expect(response.errors).toBeUndefined();
        expect(response.data.createUser).toEqual({name: 'name', username: 'username'})

        const usersQuery = await User.find({username: 'username'})
        expect(usersQuery.length).toEqual(1)
        expect(usersQuery[0].username).toEqual('username')
        expect(usersQuery[0].name).toEqual('name')
    })
})

afterAll(async () => {

    //we use different database for tests, lets clear the database
    await User.deleteMany({})

    mongoose.connection.close()
})

