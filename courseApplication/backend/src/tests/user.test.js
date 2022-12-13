
//source for testing an application that uses graphQL:  https://www.apollographql.com/docs/apollo-server/testing/testing/

const typeDefs = require('../typedefs')
const resolvers = require('../resolvers')
const config = require('../config')

const User = require('../models/user')


const userCreateQuery = 'mutation Mutation {  createUser(password: "12345", name: "name", username: "username") {    name    username  }}'
const userLogInQuery = 'mutation LogIn($username: String!, $password: String!) {  logIn(username: $username, password: $password) {   value  }}'
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
   
   console.log(`test server ready`)
})

beforeEach(async () => {
   //we use different database for tests, lets clear the database
   await User.deleteMany({})
})

describe('user tests', () => {

    test('user create mutation returns and saves created user correctly', async () => {  
       
        const response = await testServer.executeOperation({query: userCreateQuery, variables: {}})
        console.log(response)
        expect(response.errors).toBeUndefined();
        expect(response.data.createUser).toEqual({name: 'name', username: 'username'})

        const usersQuery = await User.find({username: 'username'})
        expect(usersQuery.length).toEqual(1)
        expect(usersQuery[0].username).toEqual('username')
        expect(usersQuery[0].name).toEqual('name')
    })
    describe('log in tests', () => {
        test('logIn mutation with correct credentials returns a token', async () => {  
        
            const response = await testServer.executeOperation({query: userCreateQuery, variables: {}})
            console.log(response)
            expect(response.errors).toBeUndefined();
            
            const logInResponse = await testServer.executeOperation({query: userLogInQuery, variables: {username: "username", password: "12345"}})
            expect(logInResponse.errors).toBeUndefined();
            expect(logInResponse.data.logIn).toBeDefined();
            
        })

        test('logIn mutation with incorrect password returns a null token and an error', async () => {  
        
            const response = await testServer.executeOperation({query: userCreateQuery, variables: {}})
            console.log(response)
            expect(response.errors).toBeUndefined();
            
            const logInResponse = await testServer.executeOperation({query: userLogInQuery, variables: {username: "username", password: "wrong"}})
            console.log(logInResponse)
            expect(logInResponse.errors.toString()).toContain("invalid username or password");
            expect(logInResponse.data.logIn).toBeDefined();
            
        })

        test('logIn mutation with incorrect username returns a null token and an error', async () => {  
        
            const response = await testServer.executeOperation({query: userCreateQuery, variables: {}})
            console.log(response)
            expect(response.errors).toBeUndefined();
            
            const logInResponse = await testServer.executeOperation({query: userLogInQuery, variables: {username: "username3", password: "12345"}})
            console.log(logInResponse)
            expect(logInResponse.errors.toString()).toContain("invalid username or password");
            expect(logInResponse.data.logIn).toBeDefined();
            
        })
    })
})

afterAll(async () => {

    //we use different database for tests, lets clear the database
    await User.deleteMany({})

    mongoose.connection.close()
})

